import React, { useContext, useState, useEffect } from "react";
import { FlatList, RefreshControl, View, Text, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Inbox from "./Inbox";
import { AuthContext } from "@/app/auth/AuthContext";
import { SocketContext } from "@/app/socket/SocketContext";
import { navigateToProfile } from "@/app/utils/profileNavigation";

const ListInbox = () => {
  const {
    conversations,
    pinnedConversations,
    handlerRefresh,
    addConversation,
    userInfo,
  } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await handlerRefresh();
    } catch (error) {
      console.error("Error refreshing conversations:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (socket && socket.connected) {
      const handleNewMessage = async () => {
        console.log(
          "New message received. Refreshing conversations at ListInbox..."
        );
        await handlerRefresh();
      };

      const handleNewConversation = ({ conversation }) => {
        console.log(
          "New conversation received. Refreshing conversations at ListInbox..."
        );
        addConversation(conversation);
      };

      const handleGroupDeleted = async () => {
        console.log("Group deleted. Refreshing conversations 1...");
        await handlerRefresh();
      };

      socket.on("newMessage", handleNewMessage);
      socket.on("newConversation", handleNewConversation);
      socket.on("groupDeleted", handleGroupDeleted);

      return () => {
        socket.off("newMessage", handleNewMessage);
        socket.off("newConversation", handleNewConversation);
        socket.off("groupDeleted", handleGroupDeleted);
      };
    }
  }, [socket, handlerRefresh, addConversation]);

  useEffect(() => {
    // Refresh conversations on component mount
    const initializeConversations = async () => {
      try {
        await handlerRefresh();
      } catch (error) {
        console.error("Error initializing conversations:", error);
      }
    };

    initializeConversations();
  }, [handlerRefresh]);

  // Combine pinned and non-pinned conversations
  const pinnedWithFlag = pinnedConversations.map((conv) => ({
    ...conv,
    isPinned: true,
    pinnedAt: conv.pinnedAt || new Date().toISOString(), // Use pinnedAt if available, otherwise current time
  }));
  const nonPinnedWithFlag = conversations.map((conv) => ({
    ...conv,
    isPinned: false,
  }));

  // Sort pinned conversations by pinnedAt (newest first)
  const sortedPinned = [...pinnedWithFlag].sort(
    (a, b) => new Date(b.pinnedAt) - new Date(a.pinnedAt)
  );
  // Sort non-pinned conversations by lastMessage.createdAt (newest first)
  const sortedNonPinned = [...nonPinnedWithFlag].sort((a, b) => {
    const timeA = a.lastMessage?.createdAt
      ? new Date(a.lastMessage.createdAt)
      : new Date(0);
    const timeB = b.lastMessage?.createdAt
      ? new Date(b.lastMessage.createdAt)
      : new Date(0);
    return timeB - timeA;
  });

  const allConversations = [...sortedPinned, ...sortedNonPinned];

  const renderItem = ({ item }) => {
    const handleProfileNavigation = async () => {
      try {
        const user = item.isGroup
          ? null
          : item.receiverId === userInfo.userId
          ? { userId: item.creatorId }
          : { userId: item.receiverId };

        if (user) {
          await navigateToProfile(navigation, user, {
            showLoading: true,
            onLoadingChange: setRefreshing,
          });
        }
      } catch (error) {
        console.error("Error navigating to profile:", error);
        Alert.alert("Lỗi", "Không thể mở trang cá nhân.");
      }
    };

    if (item.isPinned) {
      return (
        <View>
          {pinnedConversations.length > 0 &&
            pinnedConversations.indexOf(item) === 0 && (
              <Text
                style={{
                  paddingLeft: 20,
                  paddingVertical: 5,
                  fontWeight: "bold",
                  backgroundColor: "#f1f1f2",
                }}
              >
                Đã ghim
              </Text>
            )}
          <Inbox conversation={item} onPress={handleProfileNavigation} />
        </View>
      );
    } else {
      return (
        <View>
          {conversations.length > 0 && conversations.indexOf(item) === 0 && (
            <Text
              style={{
                paddingLeft: 20,
                paddingVertical: 5,
                fontWeight: "bold",
              }}
            >
              Khác
            </Text>
          )}
          <Inbox conversation={item} onPress={handleProfileNavigation} />
        </View>
      );
    }
  };

  return (
    <View style={{ flex: 1, width: "100%" }}>
      {allConversations.length === 0 ? (
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={allConversations}
          keyExtractor={(item) => item.conversationId.toString()}
          renderItem={renderItem}
          stickyHeaderIndices={[]}
        />
      )}
    </View>
  );
};

export default ListInbox;
