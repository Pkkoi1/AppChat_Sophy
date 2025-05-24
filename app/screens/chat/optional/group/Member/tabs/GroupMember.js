import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { View, FlatList, StyleSheet, RefreshControl, Text } from "react-native";
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native";
import { AuthContext } from "@/app/auth/AuthContext";
import RenderMember from "../memberItem/RenderMember";
import { api } from "@/app/api/api";
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";

const GroupMember = ({
  conversation: initialConversation,
  onConversationUpdate,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userInfo, groupMember } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [conversation, setConversation] = useState(initialConversation);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);

  console.log("GroupMember component rendered", groupMember);
  console.log("Conversation in GroupMember:", conversation);
  // Fetch conversation data
  const fetchConversationData = useCallback(async () => {
    if (!conversation?.conversationId) return;

    setRefreshing(true);
    try {
      const updatedConversation = await api.getConversationById(
        conversation.conversationId
      );
      if (updatedConversation) {
        setConversation(updatedConversation);
        onConversationUpdate?.(updatedConversation);
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      setError("Không thể tải thông tin cuộc trò chuyện");
    } finally {
      setRefreshing(false);
    }
  }, [conversation?.conversationId, onConversationUpdate]);

  // Update conversation when initialConversation changes
  useEffect(() => {
    if (initialConversation) {
      setConversation(initialConversation);
    }
  }, [initialConversation]);

  // Handle route params safely
  useEffect(() => {
    if (route?.params?.updatedConversation) {
      setConversation(route.params.updatedConversation);
      onConversationUpdate?.(route.params.updatedConversation);
    }
  }, [
    route?.params?.updatedConversation,
    route?.params?.refreshTrigger,
    onConversationUpdate,
  ]);

  // Automatically load data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (route?.params?.updatedConversation) {
        setConversation(route.params.updatedConversation);
        onConversationUpdate?.(route.params.updatedConversation);
      } else {
        fetchConversationData();
      }
    }, [
      fetchConversationData,
      route?.params?.updatedConversation,
      route?.params?.refreshTrigger,
    ])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversationData().finally(() => setRefreshing(false));
  }, [fetchConversationData]);

  useEffect(() => {
    // Lấy đúng data nếu conversation là response axios
    const conv =
      conversation && conversation.data && conversation.data.groupMembers
        ? conversation.data
        : conversation;
    if (!conv?.groupMembers) {
      setMembers([]);
      return;
    }
    // Lấy rule từ conv
    const ownerId = conv?.rules?.ownerId;
    const coOwnerIds = conv?.rules?.coOwnerIds || [];
    // Nếu groupMembers là mảng id, fetch info
    if (typeof conv.groupMembers[0] === "string") {
      Promise.all(conv.groupMembers.map((id) => fetchUserInfo(id))).then(
        (users) => {
          setMembers(
            users
              .filter(Boolean)
              .map((u) => ({
                id: u.userId,
                fullName: u.fullname || "",
                urlAvatar: u.urlavatar || "",
                role:
                  u.userId === ownerId
                    ? "owner"
                    : coOwnerIds.includes(u.userId)
                    ? "co-owner"
                    : "member",
              }))
          );
        }
      );
    } else {
      setMembers(conv.groupMembers);
    }
  }, [conversation]);

  // Sort members, prioritize owner
  const sortedGroupMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (a.role === "owner") return -1;
      if (b.role === "owner") return 1;
      return 0;
    });
  }, [members]);

  useEffect(() => {
    if (groupMember.length === 0) {
      setError("Không có thành viên nhóm");
    } else {
      setError(null);
    }
  }, [groupMember]);

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        style={{ padding: 16 }}
        data={sortedGroupMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RenderMember
            item={item.id}
            userInfo={userInfo}
            navigation={navigation}
            conversation={conversation.data || conversation}
            onConversationUpdate={onConversationUpdate}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default GroupMember;
