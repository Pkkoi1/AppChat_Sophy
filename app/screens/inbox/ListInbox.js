import React, { useContext, useState, useEffect, useCallback } from "react";
import { FlatList, RefreshControl, View, Text, Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Inbox from "./Inbox";
import { AuthContext } from "@/app/auth/AuthContext";
import { SocketContext } from "@/app/socket/SocketContext";
import { navigateToProfile } from "@/app/utils/profileNavigation";

const ListInbox = () => {
  const { conversations, handlerRefresh, addConversation, userInfo } =
    useContext(AuthContext);
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

  useFocusEffect(
    useCallback(() => {
      if (
        socket &&
        socket.connected &&
        conversations.length > 0 &&
        userInfo?.userId
      ) {
        const allIds = conversations.map((c) => c.conversationId);
        socket.emit("joinUserConversations", allIds);
        console.log("📡 (focus) Re-joined conversations:", allIds);
      }
    }, [socket, conversations, userInfo?.userId])
  );
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

  // Tách pinned và non-pinned từ conversations dựa vào userInfo.pinnedConversations
  const pinnedIds =
    userInfo?.pinnedConversations?.map((p) => p.conversationId) || [];
  const pinnedMap = {};
  (userInfo?.pinnedConversations || []).forEach((p) => {
    pinnedMap[p.conversationId] = p.pinnedAt;
  });

  const pinnedConversations = conversations
    .filter((conv) => pinnedIds.includes(conv.conversationId))
    .map((conv) => ({
      ...conv,
      isPinned: true,
      pinnedAt: pinnedMap[conv.conversationId] || new Date().toISOString(),
    }));

  const nonPinnedConversations = conversations
    .filter((conv) => !pinnedIds.includes(conv.conversationId))
    .map((conv) => ({
      ...conv,
      isPinned: false,
    }));

  // Sort pinned by pinnedAt, non-pinned by lastMessage.createdAt
  const sortedPinned = [...pinnedConversations].sort(
    (a, b) => new Date(b.pinnedAt) - new Date(a.pinnedAt)
  );
  const sortedNonPinned = [...nonPinnedConversations].sort((a, b) => {
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
          <Inbox conversation={item} onPress={handleProfileNavigation} />
        </View>
      );
    } else {
      return (
        <View>
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
