import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, View, Image, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Inbox from "./Inbox";
import { api } from "@/app/api/api";

const ListInbox = ({ userId }) => {
  // console.log("userId:", userId); // Log userId để kiểm tra giá trị
  const [refreshing, setRefreshing] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]); // Thêm state để lưu danh sách người dùng

  const navigation = useNavigation();

  const getConversations = async () => {
    // console.log("getConversations called"); // Kiểm tra xem hàm có được gọi không

    try {
      const response = await api.conversations();
      if (response && response.data) {
        // console.log("API Response:", response.data); // Kiểm tra phản hồi từ API
        setConversations(response.data); // Lưu toàn bộ danh sách cuộc trò chuyện
      } else {
        console.error("No conversations found in the response.");
        setConversations([]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    }
  };

  useEffect(() => {
    console.log("Screen focused"); // Kiểm tra xem sự kiện focus có hoạt động không
    getConversations();
  }, []);

  const handlerRefresh = () => {
    setRefreshing(true);
    getConversations().finally(() => setRefreshing(false));
  };
  const getConversation = async (conversationId) => {
    try {
      const response = await api.getConversationById(conversationId);
      if (response && response.data) {
        return response.data;
      } else {
        console.error("No conversation found in the response.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      return null;
    }
  };

  const renderGroupAvatar = (members) => {
    const avatarSize = 28; // Kích thước ảnh nhỏ
    const borderWidth = 2; // Viền trắng
    const gap = 18; // Khoảng cách giữa ảnh
    const containerSize = 50; // Kích thước thẻ chứa

    const positions = [
      { left: 0, top: 0 },
      { left: gap, top: 0 },
      { left: 0, top: gap },
      { left: gap, top: gap },
    ];

    const displayedMembers = members.slice(0, 4);
    const avatars = displayedMembers.map((memberId, index) => {
      if (index === 3 && members.length > 4) {
        return (
          <View
            key={index}
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              backgroundColor: "#ccc",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              ...positions[index],
              borderWidth: borderWidth,
              borderColor: "#fff",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
              +{members.length - 3}
            </Text>
          </View>
        );
      }

      return (
        <Image
          key={index}
          source={{
            uri: `https://api.example.com/avatar/${memberId}`, // Thay đổi URL avatar nếu cần
          }}
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            position: "absolute",
            ...positions[index],
            borderWidth: borderWidth,
            borderColor: "#fff",
          }}
        />
      );
    });

    return (
      <View
        style={{
          width: containerSize,
          height: containerSize,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        {avatars}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, width: "100%" }}>
      {conversations.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: "#666" }}>
            Bạn chưa có tin nhắn nào.
          </Text>
        </View>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handlerRefresh} />
          }
          data={conversations} // Sử dụng toàn bộ danh sách cuộc trò chuyện
          keyExtractor={(item) => item.conversationId.toString()} // Đảm bảo conversationId là chuỗi
          renderItem={({ item }) => (
            <Inbox
              conversation={item} // Truyền toàn bộ đối tượng conversation
              user_id={userId} // Truyền thêm userId nếu cần
            />
          )}
        />
      )}
    </View>
  );
};

export default ListInbox;
