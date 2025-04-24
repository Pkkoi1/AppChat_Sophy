import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { View, FlatList, StyleSheet, RefreshControl, Text } from "react-native";
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native"; 
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
import { AuthContext } from "@/app/auth/AuthContext";
import RenderMember from "./RenderMember";
import { api } from "@/app/api/api";

const GroupMember = ({ conversation: initialConversation, onConversationUpdate }) => {
  const navigation = useNavigation();
  const route = useRoute(); // Thêm dòng này để lấy route object
  const { userInfo } = useContext(AuthContext);
  const [userInfos, setUserInfos] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [conversation, setConversation] = useState(initialConversation);
  const [error, setError] = useState(null);

  // Fetch conversation data from API
  const fetchConversationData = useCallback(async () => {
    if (!conversation?.conversationId) return;
    
    setRefreshing(true);
    try {
      const updatedConversation = await api.getConversationById(conversation.conversationId);
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

  // Cập nhật từ initialConversation khi prop thay đổi
  useEffect(() => {
    if (initialConversation) {
      setConversation(initialConversation);
    }
  }, [initialConversation]);

  // Kiểm tra route.params an toàn
  useEffect(() => {
    if (route?.params?.updatedConversation) {
      setConversation(route.params.updatedConversation);
      onConversationUpdate?.(route.params.updatedConversation);
    }
  }, [route?.params?.updatedConversation, route?.params?.refreshTrigger, onConversationUpdate]);

  // Tự động load dữ liệu khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      if (route?.params?.updatedConversation) {
        setConversation(route.params.updatedConversation);
        onConversationUpdate?.(route.params.updatedConversation);
      } else {
        fetchConversationData();
      }
    }, [fetchConversationData, route?.params?.updatedConversation, route?.params?.refreshTrigger])
  );

  const fetchAllUserInfo = useCallback(async () => {
    const userInfoMap = {};
    for (const userId of conversation?.groupMembers || []) {
      const userInfo = await fetchUserInfo(userId);
      if (userInfo) {
        userInfoMap[userId] = userInfo;
      }
    }
    setUserInfos(userInfoMap);
  }, [conversation?.groupMembers]);

  useEffect(() => {
    fetchAllUserInfo();
  }, [fetchAllUserInfo]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchConversationData(), fetchAllUserInfo()])
      .finally(() => setRefreshing(false));
  }, [fetchConversationData, fetchAllUserInfo]);

  const sortedGroupMembers = useMemo(() => {
    return conversation?.groupMembers?.sort((a, b) => {
      if (a === conversation?.rules.ownerId) return -1;
      if (b === conversation?.rules.ownerId) return 1;
      return 0;
    });
  }, [conversation?.groupMembers, conversation?.rules?.ownerId]);

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
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <RenderMember
            item={item}
            userInfo={userInfo}
            userInfos={userInfos}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  }
});

export default GroupMember;