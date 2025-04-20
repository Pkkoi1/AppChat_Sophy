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
import * as Contacts from "expo-contacts";
import FriendSubMenu from "./SubMenu";
import Friends from "./Friend";
import { AuthContext } from "@/app/auth/AuthContext";
import { api } from "../../../api/api";
import ListFriendStyle from "./ListFriendStyle";
import { SocketContext } from "../../../socket/SocketContext"; // Thêm dòng này

const ListFriends = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [friends, setFriends] = useState([]);
  const [showPhoneContacts, setShowPhoneContacts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const { userInfo, handlerRefresh } = useContext(AuthContext);
  const [phoneContacts, setPhoneContacts] = useState([]);
  const [usersInDB, setUsersInDB] = useState([]);
  const socket = useContext(SocketContext); // Thêm dòng này

  // Lấy danh sách bạn bè từ API
  const fetchFriends = useCallback(async () => {
    if (!refreshing) setLoading(true);
    setError(null);
    try {
      const data = await api.getFriends();
      setFriends(data || []);
    } catch (err) {
      setError("Không thể tải danh sách bạn bè.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  if (socket && socket.connected) {
    socket.on("newMessage", async () => {
      console.log("New message received. Refreshing conversations at listFriend...");
      await handlerRefresh(); // Refresh the conversation list
    });
  }
  if (socket && socket.connected) {
    socket.on("newConversation", async () => {
      console.log("New convertation received. Refreshing conversations...");
      await handlerRefresh(); // Refresh the conversation list
    });
  }
  useEffect(() => {
    if (socket && socket.connected) {
      // Listen for newMessage event
      socket.on("newMessage", async () => {
        console.log("New message received. Refreshing conversations...");
        await handlerRefresh(); // Refresh the conversation list
      });
      if (socket && socket.connected) {
        socket.on("newConversation", async () => {
          console.log("New convertation received. Refreshing conversations...");
          await handlerRefresh(); // Refresh the conversation list
        });
      }
    }
  }, []);

  // Lấy danh bạ điện thoại và tìm người dùng đã đăng ký app
  const getPhoneContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        setLoading(true);
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        });

        if (data.length > 0) {
          const formattedContacts = data
            .filter(
              (contact) =>
                contact.name &&
                contact.phoneNumbers &&
                contact.phoneNumbers.length > 0
            )
            .map((contact) => {
              const phoneNumber = contact.phoneNumbers[0].number.replace(
                /[\s\-()]/g,
                ""
              );
              return {
                _id: contact.id,
                fullname: contact.name,
                phone: phoneNumber,
                isPhoneContact: true,
              };
            });

          // Lấy danh sách số điện thoại
          const phoneNumbers = formattedContacts.map((c) => c.phone);

          // Gọi API searchUsersByPhones
          try {
            const users = await api.searchUsersByPhones(phoneNumbers);
            setUsersInDB(users || []);
          } catch (err) {
            // Không cần setError ở đây, chỉ log
          }

          setPhoneContacts(formattedContacts);
        } else {
          setPhoneContacts([]);
          setUsersInDB([]);
        }
      } else {
        Alert.alert(
          "Cần quyền truy cập danh bạ",
          "Ứng dụng cần quyền truy cập danh bạ để hiển thị danh sách liên hệ của bạn",
          [
            { text: "Đóng", style: "cancel" },
            { text: "Cài đặt", onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (err) {
      setError("Không thể truy cập danh bạ điện thoại: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
    getPhoneContacts();
  }, [fetchFriends]);

  // Lắng nghe sự kiện acceptedFriendRequest từ socket
  useEffect(() => {
    if (!socket) return;
    const handleAcceptedFriendRequest = () => {
      fetchFriends(); // Cập nhật lại danh sách bạn bè
    };
    socket.on("acceptedFriendRequest", handleAcceptedFriendRequest);
    return () => {
      socket.off("acceptedFriendRequest", handleAcceptedFriendRequest);
    };
  }, [socket, fetchFriends]);

  const handlerRefreshList = () => {
    setRefreshing(true);
    fetchFriends();
    getPhoneContacts();
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
