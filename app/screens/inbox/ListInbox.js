import React, { useContext, useEffect, useState } from "react";
import { FlatList, RefreshControl, View, Image, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Inbox from "./Inbox";
import { api } from "@/app/api/api";
import { AuthContext } from "@/app/auth/AuthContext";

const ListInbox = () => {
  const { userInfo } = useContext(AuthContext);
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
        // Sort conversations by lastChange (descending) and createdAt (descending)
        const sortedConversations = response.data.sort((a, b) => {
          const lastChangeDiff =
            new Date(b.lastChange) - new Date(a.lastChange);
          if (lastChangeDiff !== 0) return lastChangeDiff;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setConversations(sortedConversations); // Lưu danh sách đã sắp xếp
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

  return (
    <View style={{ flex: 1, width: "100%" }}>
      {conversations.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 16, color: "#666" }}>
            Bạn chưa có tin nhắn nào.
          </Text>
        </View>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handlerRefresh}
            />
          }
          data={conversations} // Sử dụng toàn bộ danh sách cuộc trò chuyện
          keyExtractor={(item) => item.conversationId.toString()} // Đảm bảo conversationId là chuỗi
          renderItem={({ item }) => (
            <Inbox
              conversation={item} // Truyền toàn bộ đối tượng conversation
            />
          )}
        />
      )}
    </View>
  );
};

export default ListInbox;
