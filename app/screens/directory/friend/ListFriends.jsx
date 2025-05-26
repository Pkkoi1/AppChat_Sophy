import React, {
  useState,
  useCallback,
  useEffect,
  useContext,
  useMemo,
} from "react";
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import FriendSubMenu from "./SubMenu";
import Friends from "./Friend";
import { AuthContext } from "@/app/auth/AuthContext";
import ListFriendStyle from "./ListFriendStyle";
import { SocketContext } from "../../../socket/SocketContext";
import { useNavigateToProfile } from "@/app/utils/profileNavigation";

const ListFriends = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [showPhoneContacts, setShowPhoneContacts] = useState(false);
  const navigation = useNavigation();
  const {
    userInfo,
    handlerRefresh,
    phoneContacts,
    usersInDB,
    getPhoneContacts,
    contactsLoading,
    contactsError,
    addConversation,
    friends,
    friendsLoading,
    friendsError,
    fetchFriends,
    updateFriendsList,
  } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigateToProfile = useNavigateToProfile();

  useEffect(() => {
    console.log("[ListFriends] useEffect fetchFriends & getPhoneContacts");
    fetchFriends();
    getPhoneContacts();
  }, [fetchFriends, getPhoneContacts]);

  // Lắng nghe sự kiện acceptedFriendRequest từ socket
  useEffect(() => {
    if (!socket) return;
    console.log("[ListFriends] useEffect socket events");

    const handleAcceptedFriendRequest = () => {
      console.log("[ListFriends] socket acceptedFriendRequest");
      updateFriendsList();
    };

    const handleRemovedFriend = (data) => {
      console.log("[ListFriends] socket removedFriend", data);
      if (data && data.userId) {
        updateFriendsList(null, data.userId);
      }
    };

    socket.on("acceptedFriendRequest", handleAcceptedFriendRequest);
    socket.on("removedFriend", handleRemovedFriend);

    return () => {
      socket.off("acceptedFriendRequest", handleAcceptedFriendRequest);
      socket.off("removedFriend", handleRemovedFriend);
    };
  }, [socket, updateFriendsList]);

  const handlerRefreshList = () => {
    console.log("[ListFriends] handlerRefreshList");
    setRefreshing(true);
    Promise.all([fetchFriends(), getPhoneContacts()]).finally(() =>
      setRefreshing(false)
    );
  };

  // Hiển thị header
  const renderHeader = useCallback(() => {
    // Đã bỏ log ở đây để tránh log lặp
    return (
      <View style={ListFriendStyle.container}>
        <FriendSubMenu />
        <View style={ListFriendStyle.buttonContainer}>
          <TouchableOpacity
            style={[
              ListFriendStyle.buttonTab,
              !showPhoneContacts && ListFriendStyle.buttonAll,
            ]}
            onPress={() => setShowPhoneContacts(false)}
          >
            <View style={ListFriendStyle.buttonContent}>
              <Text>Bạn bè</Text>
              <Text>{friends.length}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              ListFriendStyle.buttonTab,
              showPhoneContacts && ListFriendStyle.buttonNew,
            ]}
            onPress={() => setShowPhoneContacts(true)}
          >
            <Text>Danh bạ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [showPhoneContacts, friends.length]);

  // Nếu đang ở chế độ danh bạ, hiển thị người dùng đã đăng ký app lên đầu
  // Memo hóa displayData để không tạo mới mỗi lần render
  const displayData = useMemo(() => {
    if (showPhoneContacts) {
      const uniquePhones = new Set();
      const usersInContacts = usersInDB
        .map((user) => {
          const matchedContact = phoneContacts.find(
            (c) => c.phone === user.phone
          );
          // Đảm bảo mỗi số điện thoại chỉ xuất hiện 1 lần
          if (uniquePhones.has(user.phone)) return null;
          uniquePhones.add(user.phone);
          return {
            ...user,
            fullname: matchedContact ? matchedContact.fullname : user.fullname,
            isPhoneContact: true,
            isAppUser: true,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.fullname.localeCompare(b.fullname));

      // Các contact còn lại chưa dùng app, loại bỏ trùng lặp
      const contactsNotInApp = phoneContacts
        .filter(
          (c) =>
            !usersInDB.some((u) => u.phone === c.phone) &&
            !uniquePhones.has(c.phone)
        )
        .map((c) => ({
          ...c,
          isAppUser: false,
        }))
        .sort((a, b) => a.fullname.localeCompare(b.fullname));

      return [...usersInContacts, ...contactsNotInApp];
    } else {
      return friends
        .map((f) => ({
          ...f,
          isAppUser: true,
        }))
        .sort((a, b) => a.fullname.localeCompare(b.fullname));
    }
  }, [showPhoneContacts, usersInDB, phoneContacts, friends]);

  // Memo hóa groupedContacts
  const groupedContacts = useMemo(() => {
    return displayData.reduce((acc, contact) => {
      const firstLetter = contact.fullname
        ? contact.fullname[0].toUpperCase()
        : "#";
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(contact);
      return acc;
    }, {});
  }, [displayData]);

  // Memo hóa contentContainerStyle
  const contentContainerStyle = useMemo(() => ListFriendStyle.container, []);

  // Memo hóa renderItem
  const renderItem = useCallback(
    ({ item }) => (
      <View style={ListFriendStyle.listFriendContainer}>
        <Text style={ListFriendStyle.categoryTitle}>{item}</Text>
        {groupedContacts[item]?.map((contact) => (
          <TouchableOpacity
            key={contact._id || contact.phone}
            onPress={() => {
              if (showPhoneContacts && contact.isAppUser) {
                navigateToProfile(navigation, contact);
              } else if (showPhoneContacts && contact.isPhoneContact) {
                Alert.alert(
                  "Liên hệ",
                  `Gọi cho ${contact.fullname} (${contact.phone})`
                );
              } else {
                navigateToProfile(navigation, contact);
              }
            }}
          >
            <Friends friend={contact} />
          </TouchableOpacity>
        ))}
      </View>
    ),
    [groupedContacts, showPhoneContacts, navigation, navigateToProfile]
  );

  const loading = showPhoneContacts ? contactsLoading : friendsLoading;
  const error = showPhoneContacts ? contactsError : friendsError;

  // Chỉ log khi showPhoneContacts hoặc friends.length thay đổi
  useEffect(() => {
    console.log(
      "[ListFriends] render, showPhoneContacts:",
      showPhoneContacts,
      "friends.length:",
      friends.length,
      "phoneContacts.length:",
      phoneContacts.length
    );
  }, [showPhoneContacts, friends.length, phoneContacts.length]);

  return (
    <View>
      {loading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          ListHeaderComponent={renderHeader}
          data={Object.keys(groupedContacts)}
          keyExtractor={(item) => item}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handlerRefreshList}
            />
          }
          renderItem={renderItem}
          contentContainerStyle={contentContainerStyle}
        />
      )}
      {error && (
        <Text style={{ color: "red", textAlign: "center", margin: 10 }}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default ListFriends;
