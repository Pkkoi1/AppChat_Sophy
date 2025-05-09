import React, { useState, useCallback, useEffect, useContext } from "react";
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
    updateFriendsList
  } = useContext(AuthContext);
  const socket = useContext(SocketContext);

  useEffect(() => {
    fetchFriends();
    getPhoneContacts();
  }, [fetchFriends, getPhoneContacts]);

  // Lắng nghe sự kiện acceptedFriendRequest từ socket
  useEffect(() => {
    if (!socket) return;
    
    const handleAcceptedFriendRequest = () => {
      updateFriendsList(); // Cập nhật danh sách bạn bè khi có người chấp nhận lời mời
    };
    
    const handleRemovedFriend = (data) => {
      if (data && data.userId) {
        updateFriendsList(null, data.userId); // Cập nhật khi có người bạn bị xóa
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
    setRefreshing(true);
    Promise.all([fetchFriends(), getPhoneContacts()])
      .finally(() => setRefreshing(false));
  };

  // Hiển thị header
  const renderHeader = () => (
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

  // Nếu đang ở chế độ danh bạ, hiển thị người dùng đã đăng ký app lên đầu
  let displayData = [];
  if (showPhoneContacts) {
    // Tìm các user trong DB có số điện thoại trùng với danh bạ
    const usersInContacts = usersInDB
      .map((user) => {
        // Tìm contact trong danh bạ để lấy fullname nếu có
        const matchedContact = phoneContacts.find(
          (c) => c.phone === user.phone
        );
        return {
          ...user,
          fullname: matchedContact ? matchedContact.fullname : user.fullname,
          isPhoneContact: true,
          isAppUser: true,
        };
      })
      .sort((a, b) => a.fullname.localeCompare(b.fullname));

    // Các contact còn lại chưa dùng app
    const contactsNotInApp = phoneContacts
      .filter((c) => !usersInDB.some((u) => u.phone === c.phone))
      .map((c) => ({
        ...c,
        isAppUser: false,
      }))
      .sort((a, b) => a.fullname.localeCompare(b.fullname));

    displayData = [...usersInContacts, ...contactsNotInApp];
  } else {
    displayData = friends
      .map((f) => ({
        ...f,
        isAppUser: true,
      }))
      .sort((a, b) => a.fullname.localeCompare(b.fullname));
  }

  // Nhóm theo chữ cái đầu tiên
  const groupedContacts = displayData.reduce((acc, contact) => {
    const firstLetter = contact.fullname
      ? contact.fullname[0].toUpperCase()
      : "#";
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(contact);
    return acc;
  }, {});

  const loading = showPhoneContacts ? contactsLoading : friendsLoading;
  const error = showPhoneContacts ? contactsError : friendsError;

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
          renderItem={({ item }) => (
            <View style={ListFriendStyle.listFriendContainer}>
              <Text style={ListFriendStyle.categoryTitle}>{item}</Text>
              {groupedContacts[item]?.map((contact) => (
                <TouchableOpacity
                  key={contact._id || contact.phone}
                  onPress={() => {
                    if (showPhoneContacts && contact.isAppUser) {
                      navigation.navigate("UserProfile", {
                        friend: contact,
                        requestSent: "friend",
                      });
                    } else if (showPhoneContacts && contact.isPhoneContact) {
                      Alert.alert(
                        "Liên hệ",
                        `Gọi cho ${contact.fullname} (${contact.phone})`
                      );
                    } else {
                      navigation.navigate("UserProfile", {
                        friend: contact,
                        requestSent: "friend",
                      });
                    }
                  }}
                >
                  <Friends friend={contact} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          contentContainerStyle={ListFriendStyle.container}
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
