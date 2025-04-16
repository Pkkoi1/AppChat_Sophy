import React, { useState, useCallback, useEffect, useContext } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Contacts from 'expo-contacts';
import FriendSubMenu from "./SubMenu";
import Friends from "./Friend";
import { AuthContext } from "@/app/auth/AuthContext";
import { api } from "../../../api/api";
import ListFriendStyle from "./ListFriendStyle";

const ListFriends = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [friends, setFriends] = useState([]);
  const [phoneContacts, setPhoneContacts] = useState([]);
  const [showPhoneContacts, setShowPhoneContacts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);

  const fetchFriends = useCallback(async () => {
    if (!refreshing) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await api.getFriends();
      console.log("Danh sách bạn bè:", data);
      setFriends(data || []);
    } catch (err) {
      console.error("Failed to fetch friends:", err);
      setError("Không thể tải danh sách bạn bè.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  const getPhoneContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        setLoading(true);
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        });
  
        if (data.length > 0) {
          // Lọc và định dạng danh bạ
          const formattedContacts = data
            .filter(contact => contact.name && contact.phoneNumbers && contact.phoneNumbers.length > 0)
            .map(contact => {
              // Lấy số điện thoại đầu tiên và loại bỏ khoảng trắng, dấu gạch ngang, dấu ngoặc
              const phoneNumber = contact.phoneNumbers[0].number.replace(/[\s\-()]/g, '');
              
              return {
                _id: contact.id,
                fullname: contact.name,
                phone: phoneNumber,
                isPhoneContact: true,
              };
            });
            
          console.log(`Đã tìm thấy ${formattedContacts.length} liên hệ trong danh bạ`);
          setPhoneContacts(formattedContacts);
        } else {
          console.log("Không tìm thấy liên hệ nào trong danh bạ");
          setPhoneContacts([]);
        }
      } else {
        Alert.alert(
          "Cần quyền truy cập danh bạ",
          "Ứng dụng cần quyền truy cập danh bạ để hiển thị danh sách liên hệ của bạn",
          [
            { text: "Đóng", style: "cancel" },
            { 
              text: "Cài đặt", 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
      }
    } catch (err) {
      console.error("Lỗi khi truy cập danh bạ:", err);
      setError("Không thể truy cập danh bạ điện thoại: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
    getPhoneContacts();
  }, [fetchFriends]);

  const handlerRefresh = () => {
    setRefreshing(true);
    fetchFriends();
    getPhoneContacts();
  };

  const toggleContactsView = () => {
    setShowPhoneContacts(!showPhoneContacts);
  };

  const renderHeader = () => (
    <View style={ListFriendStyle.container}>
      <FriendSubMenu />
      <View style={ListFriendStyle.buttonContainer}>
        <TouchableOpacity
          style={[
            ListFriendStyle.buttonTab, 
            !showPhoneContacts && ListFriendStyle.buttonAll
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
            showPhoneContacts && ListFriendStyle.buttonNew
          ]}
          onPress={() => setShowPhoneContacts(true)}
        >
          <Text>Danh bạ điện thoại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Xử lý dữ liệu hiển thị dựa vào chế độ xem
  const displayData = showPhoneContacts ? phoneContacts : friends;

  // Sắp xếp danh sách theo chữ cái đầu tiên của fullname
  const sortedContacts = displayData
    .filter((contact) => contact && contact.fullname)
    .sort((a, b) => a.fullname.localeCompare(b.fullname));

  // Nhóm theo chữ cái đầu tiên
  const groupedContacts = sortedContacts.reduce((acc, contact) => {
    const firstLetter = contact.fullname[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(contact);
    return acc;
  }, {});

  return (
    <View>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#0000ff" style={{marginTop: 20}} />
      ) : (
        <FlatList
          ListHeaderComponent={renderHeader}
          data={Object.keys(groupedContacts)}
          keyExtractor={(item) => item}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handlerRefresh} />
          }
          renderItem={({ item }) => (
            <View style={ListFriendStyle.listFriendContainer}>
              <Text style={ListFriendStyle.categoryTitle}>{item}</Text>
              {groupedContacts[item]?.map((contact) => (
                <TouchableOpacity
                  key={contact._id}
                  onPress={() =>
                    contact.isPhoneContact 
                      ? Alert.alert("Liên hệ", `Gọi cho ${contact.fullname} (${contact.phone})`)
                      : navigation.navigate("UserProfile", {
                          friend: contact,
                          requestSent: 'friend',
                        })
                  }
                >
                  <Friends friend={contact} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          contentContainerStyle={ListFriendStyle.container}
        />
      )}
      {error && <Text style={{color: 'red', textAlign: 'center', margin: 10}}>{error}</Text>}
    </View>
  );
};

export default ListFriends;