import React, {
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
  } from "react";
  import {
    View,
    FlatList,
    StyleSheet,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    RefreshControl,
  } from "react-native";
  import { useNavigation } from "@react-navigation/native";
  import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
  import { AuthContext } from "@/app/auth/AuthContext";
  import AvatarUser from "@/app/components/profile/AvatarUser";
  import { api } from "@/app/api/api";
  
  const BlockedMembers = ({ conversation, onConversationUpdate }) => {
    const navigation = useNavigation();
    const { userInfo } = useContext(AuthContext);
    const [userInfos, setUserInfos] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
  
    // useRef to hold the latest conversation prop
    const conversationRef = useRef(conversation);
  
    // Update the ref whenever the conversation prop changes
    useEffect(() => {
      conversationRef.current = conversation;
    }, [conversation]);
  
    const blockedUserIds = conversationRef.current?.blocked || [];
  
    const fetchAllUserInfo = useCallback(async () => {
      if (blockedUserIds.length === 0) {
        setLoading(false);
        return;
      }
  
      setLoading(true);
      try {
        const userInfoMap = {};
        for (const userId of blockedUserIds) {
          try {
            const userInfo = await fetchUserInfo(userId);
            if (userInfo) {
              userInfoMap[userId] = userInfo;
            }
          } catch (err) {
            console.error(`Error fetching user info for ${userId}:`, err);
          }
        }
        setUserInfos(userInfoMap);
        setError(null);
      } catch (error) {
        console.error("Error fetching blocked users:", error);
        setError("Không thể tải dữ liệu người dùng bị chặn");
      } finally {
        setLoading(false);
      }
    }, [blockedUserIds]);
  
    useEffect(() => {
      fetchAllUserInfo();
    }, [fetchAllUserInfo]);
  
    const onRefresh = useCallback(async () => {
      if (refreshing || !conversationRef.current?.conversationId) return;
  
      setRefreshing(true);
      try {
        const updatedConversation = await api.getConversationById(
          conversationRef.current.conversationId
        );
        if (updatedConversation) {
          // Only update the parent component
          onConversationUpdate?.(updatedConversation);
          setError(null);
        }
      } catch (error) {
        console.error("Error refreshing data:", error);
  
        if (error.response && error.response.status === 404) {
          setError("Cuộc trò chuyện không tồn tại hoặc đã bị xóa");
          Alert.alert(
            "Thông báo",
            "Cuộc trò chuyện không tồn tại hoặc đã bị xóa",
            [{ text: "OK", onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert("Lỗi", "Không thể làm mới dữ liệu.");
          setError("Không thể làm mới dữ liệu");
        }
      } finally {
        setRefreshing(false);
      }
    }, [navigation, onConversationUpdate, refreshing]);
  
    const handleUnblock = useCallback(
        async (userId, fullname) => {
          if (!conversationRef.current?.conversationId) {
            Alert.alert("Lỗi", "Không thể bỏ chặn: Cuộc trò chuyện không hợp lệ");
            return;
          }
      
          Alert.alert(
            "Bỏ chặn thành viên",
            `Bạn có chắc chắn muốn bỏ chặn ${fullname || "thành viên này"} không?`,
            [
              {
                text: "Hủy",
                style: "cancel",
              },
              {
                text: "Bỏ chặn",
                onPress: async () => {
                  try {
                    await api.unblockUserFromGroup(
                      conversationRef.current.conversationId,
                      userId
                    );
      
                    Alert.alert(
                      "Thành công",
                      `Đã bỏ chặn ${fullname || "thành viên"} khỏi nhóm.`
                    );
      
                    // Update the blockedUserIds state to remove the unblocked user
                    setUserInfos((prevUserInfos) => {
                      const { [userId]: removedUserInfo, ...rest } = prevUserInfos;
                      return rest;
                    });
                  } catch (error) {
                    console.error("Lỗi khi bỏ chặn thành viên:", error);
      
                    if (error.response && error.response.status === 404) {
                      setError("Cuộc trò chuyện không tồn tại hoặc đã bị xóa");
                      Alert.alert(
                        "Lỗi",
                        "Cuộc trò chuyện không tồn tại hoặc đã bị xóa",
                        [{ text: "OK", onPress: () => navigation.goBack() }]
                      );
                    } else {
                      Alert.alert(
                        "Lỗi",
                        `Không thể bỏ chặn thành viên. ${
                          error.response?.data?.message || error.message
                        }`
                      );
                    }
                  }
                },
              },
            ]
          );
        },
        [navigation]
      );
  
  
    const renderBlockedMember = useCallback(
      ({ item }) => {
        const memberInfo = userInfos[item];
        if (!memberInfo) return null;
  
        const isOwner =
          userInfo?.userId === conversationRef.current?.rules?.ownerId;
        const isCoOwner =
          conversationRef.current?.rules?.coOwnerIds?.includes(userInfo?.userId);
        const canUnblock = isOwner || isCoOwner;
  
        return (
          <View style={styles.memberContainer}>
            <View style={styles.avatarContainer}>
              {memberInfo.urlavatar ? (
                <Image
                  source={{ uri: memberInfo.urlavatar }}
                  style={styles.avatar}
                />
              ) : (
                <AvatarUser
                  fullName={memberInfo.fullname || "User"}
                  width={40}
                  height={40}
                  avtText={16}
                  shadow={false}
                  bordered={false}
                />
              )}
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.memberName}>
                {memberInfo.fullname || "Không rõ"}
              </Text>
              <Text style={styles.memberStatus}>Đã bị chặn</Text>
            </View>
            {canUnblock && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleUnblock(item, memberInfo.fullname)}
              >
                <Text style={styles.actionButtonText}>Bỏ chặn</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      },
      [userInfos, userInfo?.userId, handleUnblock]
    );
  
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }
  
    return (
      <View style={styles.container}>
        {blockedUserIds.length > 0 ? (
          <FlatList
            style={{ padding: 16 }}
            data={blockedUserIds}
            keyExtractor={(item) => String(item)}
            renderItem={renderBlockedMember}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              loading ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Đang tải...</Text>
                </View>
              ) : null
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có thành viên nào bị chặn</Text>
          </View>
        )}
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      color: "#e74c3c",
      textAlign: "center",
    },
    memberContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: "#eee",
    },
    avatarContainer: {
      marginRight: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    infoContainer: {
      flex: 1,
    },
    memberName: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#000",
    },
    memberStatus: {
      fontSize: 14,
      color: "#c0392b",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      color: "#777",
      textAlign: "center",
    },
    actionButton: {
      backgroundColor: "#e74c3c",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    actionButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "500",
    },
  });
  
  export default BlockedMembers;