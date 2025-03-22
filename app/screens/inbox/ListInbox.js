import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, View, Image, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Inbox from "./Inbox";
import { api } from "@/api/api";

const ListInbox = ({ userId, id }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [conversations, setConversations] = useState([]);

  const navigation = useNavigation();

  const getConversations = async () => {
    try {
      const response = await api.conversations();
      if (response && response.data) {
        setConversations(response.data || []); // Đảm bảo conversations luôn là mảng
      } else {
        console.error("No conversations found in the response.");
        setConversations([]); // Đặt giá trị mặc định nếu không có dữ liệu
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]); // Đặt giá trị mặc định nếu có lỗi
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      getConversations();
    });
    return unsubscribe;
  }, [navigation]);

  const handlerRefresh = () => {
    setRefreshing(true);
    getConversations().finally(() => setRefreshing(false));
  };

  // Lọc các cuộc trò chuyện mà userId nằm trong groupMembers
  const filteredConversations = (conversations || []).filter(
    (conversation) =>
      Array.isArray(conversation.groupMembers) &&
      conversation.creatorId.includes(userId)
  );

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
      <FlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handlerRefresh} />
        }
        data={filteredConversations}
        keyExtractor={(item) => item.conversationId.toString()} // Đảm bảo conversationId là chuỗi
        renderItem={({ item }) => {
          const lastMessage = item.lastMessage || {
            content: "No messages yet",
            createdAt: null,
          };
          const otherMembers = item.groupMembers.filter(
            (memberId) => memberId !== userId
          );

          let avatar;
          if (item.isGroup) {
            avatar = item.groupAvatarUrl
              ? { uri: item.groupAvatarUrl }
              : renderGroupAvatar(otherMembers); // Render avatar nhóm
          } else {
            avatar =
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbHfn_ap7TA8_f2b-QWEdQWRTtlI8U5strBQ&s"; // Avatar mặc định
          }

          return (
            <Inbox
              name={item.isGroup ? item.groupName : "Private Chat"}
              avatar={avatar}
              message={lastMessage.content}
              date={lastMessage.createdAt}
              conversation_id={item.conversationId}
              user_id={userId}
              groupName={item.groupName}
              receiverId={item.receiverId}
              id={id}
            />
          );
        }}
      />
    </View>
  );
};

export default ListInbox;
