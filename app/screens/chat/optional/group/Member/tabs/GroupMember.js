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

  // Sort groupMember, prioritize owner
  const sortedGroupMembers = useMemo(() => {
    return groupMember.sort((a, b) => {
      if (a.role === "owner") return -1;
      if (b.role === "owner") return 1;
      return 0;
    });
  }, [groupMember]);

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
            conversation={conversation}
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
