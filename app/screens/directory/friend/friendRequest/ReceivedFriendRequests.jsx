import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import HeadView from "../../../header/Header";
import Color from "../../../../components/colors/Color";
import { api } from "../../../../api/api";
import { SocketContext } from "../../../../socket/SocketContext";
import AvatarUser from "@/app/components/profile/AvatarUser";
import { useNavigateToProfile } from "@/app/utils/profileNavigation";

const groupByTime = (data) => {
  if (!data || data.length === 0) return [];
  
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setDate(today.getDate() - 30);

  const sections = {};

  data.forEach((item) => {
    const itemDate = new Date(item.timestamp || Date.now());
    const diffDays = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24));

    let sectionTitle;
    if (diffDays === 0) {
      sectionTitle = "Hôm nay";
    } else if (diffDays === 1) {
      sectionTitle = "Hôm qua";
    } else if (itemDate >= oneMonthAgo) {
      sectionTitle = itemDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } else {
      sectionTitle = "Cũ hơn";
    }

    sections[sectionTitle] = sections[sectionTitle] || [];
    sections[sectionTitle].push(item);
  });

  return Object.keys(sections)
    .map((key) => ({
      title: key,
      data: sections[key],
    }))
    .sort((a, b) => {
      if (a.title === "Hôm nay") return -1;
      if (b.title === "Hôm nay") return 1;
      if (a.title === "Hôm qua") return -1;
      if (b.title === "Hôm qua") return 1;
      if (a.title === "Cũ hơn") return 1;
      if (b.title === "Cũ hơn") return -1;
      const dateA = new Date(a.data[0].timestamp || Date.now());
      const dateB = new Date(b.data[0].timestamp || Date.now());
      return dateB - dateA;
    });
};

const ReceivedFriendRequests = ({ navigation }) => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [index, setIndex] = useState(0);

  const socket = useContext(SocketContext);
  const navigateToProfile = useNavigateToProfile();

  // Memo hóa routes để tránh setState lặp lại
  const routes = useMemo(() => [
    { key: "received", title: `Đã nhận ${receivedRequests.length}` },
    { key: "sent", title: `Đã gửi ${sentRequests.length}` },
  ], [receivedRequests.length, sentRequests.length]);

  // Hàm làm mới dữ liệu
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const receivedData = await api.getFriendRequestsReceived();
      const sentData = await api.getFriendRequestsSent();

      setReceivedRequests(receivedData || []);
      setSentRequests(sentData || []);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu lời mời kết bạn:", err);
      setError("Không thể tải dữ liệu lời mời kết bạn");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const receivedData = await api.getFriendRequestsReceived();
        const sentData = await api.getFriendRequestsSent();

        setReceivedRequests(receivedData || []);
        setSentRequests(sentData || []);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu lời mời kết bạn:", err);
        setError("Không thể tải dữ liệu lời mời kết bạn");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Xử lý các sự kiện socket
  useEffect(() => {
    if (!socket) return;

    const handleNewFriendRequest = (data) => {
      console.log("SOCKET newFriendRequest:", data);
      if (data) {
        setReceivedRequests((prev) => {
          const newRequests = [data, ...prev];
          return newRequests;
        });
      }
    };

    const handleRejectedFriendRequest = ({ friendRequestData }) => {
      console.log("SOCKET rejectedFriendRequest:", friendRequestData);
      if (friendRequestData) {
        setSentRequests((prev) => {
          const updated = prev.filter(
            (req) => req.friendRequestId !== friendRequestData
          );
          return updated;
        });
      }
    };

    const handleAcceptedFriendRequest = ({ friendRequestData }) => {
      console.log("SOCKET acceptedFriendRequest:", friendRequestData);
      if (friendRequestData) {
        setSentRequests((prev) => {
          const updated = prev.filter(
            (req) => req.friendRequestId !== friendRequestData
          );
          return updated;
        });
      }
    };

    const handleRetrievedFriendRequest = ({ friendRequestData }) => {
      console.log("SOCKET retrievedFriendRequest:", friendRequestData);
      if (friendRequestData) {
        setReceivedRequests((prev) => {
          const updated = prev.filter(
            (req) => req.friendRequestId !== friendRequestData
          );
          return updated;
        });
      }
    };

    socket.on("newFriendRequest", handleNewFriendRequest);
    socket.on("rejectedFriendRequest", handleRejectedFriendRequest);
    socket.on("acceptedFriendRequest", handleAcceptedFriendRequest);
    socket.on("retrievedFriendRequest", handleRetrievedFriendRequest);

    return () => {
      socket.off("newFriendRequest", handleNewFriendRequest);
      socket.off("rejectedFriendRequest", handleRejectedFriendRequest);
      socket.off("acceptedFriendRequest", handleAcceptedFriendRequest);
      socket.off("retrievedFriendRequest", handleRetrievedFriendRequest);
    };
  }, [socket]);

  // Xử lý chấp nhận lời mời kết bạn
  const handleAccept = async (item) => {
    try {
      setLoading(true);
      console.log("ACCEPT.friendRequestId:", item);
      
      await api.acceptFriendRequest(item.friendRequestId);
      
      setReceivedRequests((prevRequests) => {
        const updated = prevRequests.filter(
          (request) => request.friendRequestId !== item.friendRequestId
        );
        return updated;
      });
      
      Alert.alert(
        "Thành công",
        `Đã chấp nhận lời mời kết bạn từ ${item.sender?.fullname || 'người dùng'}`
      );
    } catch (err) {
      console.error("Lỗi khi chấp nhận lời mời kết bạn:", err);
      Alert.alert(
        "Lỗi",
        "Không thể chấp nhận lời mời kết bạn. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  // Xử lý từ chối lời mời kết bạn
  const handleReject = async (item) => {
    try {
      setLoading(true);
      console.log("REJECT.friendRequestId:", item);
      
      await api.rejectFriendRequest(item.friendRequestId);
      
      setReceivedRequests((prevRequests) => {
        const updated = prevRequests.filter(
          (request) => request.friendRequestId !== item.friendRequestId
        );
        return updated;
      });
      
      Alert.alert(
        "Thành công",
        `Đã từ chối lời mời kết bạn từ ${item.sender?.fullname || 'người dùng'}`
      );
    } catch (err) {
      console.error("Lỗi khi từ chối lời mời kết bạn:", err);
      Alert.alert(
        "Lỗi",
        "Không thể từ chối lời mời kết bạn. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thu hồi lời mời kết bạn
  const handleWithdraw = async (item) => {
    try {
      console.log("WITHDRAW.friendRequestId:", item);
      
      await api.retrieveFriendRequest(item.friendRequestId);
      
      setSentRequests((prevRequests) => {
        const updated = prevRequests.filter(
          (request) => request.friendRequestId !== item.friendRequestId
        );
        return updated;
      });
      
      Alert.alert(
        "Thành công",
        `Đã thu hồi lời mời kết bạn với ${item.receiverId?.fullname || 'người dùng'}`
      );
    } catch (err) {
      console.error("Lỗi khi thu hồi lời mời kết bạn:", err);
      Alert.alert(
        "Lỗi",
        "Không thể thu hồi lời mời kết bạn. Vui lòng thử lại sau."
      );
    }
  };

  useEffect(() => {
  }, []);

  useEffect(() => {
  }, [receivedRequests.length, sentRequests.length]);

  useEffect(() => {
  }, [loading, refreshing, error]);

  // Tab Lời mời đã nhận
  const renderReceivedTab = useMemo(() => {
    let logged = false;
    return () => {
      if (!logged) {
        logged = true;
      }

      if (loading && !refreshing) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Color.blueBackgroundButton} />
          </View>
        );
      }

      if (error) {
        return (
          <View style={styles.emptyContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        );
      }

      return (
        <SectionList
          sections={groupByTime(receivedRequests)}
          keyExtractor={(item) => item.friendRequestId || item._id || Math.random().toString()}
          renderItem={({ item }) => {
            const user = item.sender || item.senderId || {};
            return (
              <TouchableOpacity
                style={styles.requestItem}
                onPress={() => navigateToProfile(navigation, user)}
              >
                {user.urlavatar || user.avatar ? (
                  <Image
                    source={{
                      uri: user.urlavatar || user.avatar || "https://via.placeholder.com/50",
                    }}
                    style={styles.avatar}
                  />
                ) : (
                  <AvatarUser
                    fullName={user.fullname || "Người dùng"}
                    width={50}
                    height={50}
                    avtText={20}
                    style={styles.avatar}
                  />
                )}

                <View style={styles.infoWrapper}>
                  <Text style={styles.name}>{user?.fullname || "Người dùng"}</Text>
                  <Text style={styles.status}>{"Muốn kết bạn"}</Text>
                  <View style={styles.buttonContainer}>
                    {loading ? (
                      <ActivityIndicator
                        size="small"
                        color={Color.blueBackgroundButton}
                      />
                    ) : (
                      <>
                        <TouchableOpacity
                          style={styles.rejectButton}
                          onPress={() => handleReject(item)}
                          disabled={loading}
                        >
                          <Text style={styles.rejectText}>TỪ CHỐI</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.acceptButton}
                          onPress={() => handleAccept(item)}
                          disabled={loading}
                        >
                          <Text style={styles.acceptText}>ĐỒNG Ý</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
              <View style={styles.line} />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không có lời mời kết bạn</Text>
            </View>
          }
          style={styles.list}
        />
      );
    };
  }, [loading, refreshing, error, receivedRequests, navigation, onRefresh, handleReject, handleAccept, navigateToProfile]);

  // Tab Lời mời đã gửi
  const renderSentTab = useMemo(() => {
    let logged = false;
    return () => {
      if (!logged) {
        logged = true;
      }

      if (loading && !refreshing) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Color.blueBackgroundButton} />
          </View>
        );
      }

      if (error) {
        return (
          <View style={styles.emptyContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        );
      }

      return (
        <SectionList
          sections={groupByTime(sentRequests)}
          keyExtractor={(item) => item.friendRequestId || item._id || Math.random().toString()}
          renderItem={({ item }) => {
            const user = item.receiver || item.receiverId || {};
            return (
              <TouchableOpacity
                style={styles.requestItem}
                onPress={() => navigateToProfile(navigation, user)}
              >
                {user.urlavatar || user.avatar ? (
                  <Image
                    source={{
                      uri: user.urlavatar || user.avatar || "https://via.placeholder.com/50",
                    }}
                    style={styles.avatar}
                  />
                ) : (
                  <AvatarUser
                    fullName={user.fullname || "Người dùng"}
                    width={50}
                    height={50}
                    avtText={20}
                    style={styles.avatar}
                  />
                )}

                <View style={styles.infoWrapper}>
                  <Text style={styles.name}>{user?.fullname || "Người dùng"}</Text>
                  <Text style={styles.status}>{"Đã gửi lời mời kết bạn"}</Text>
                  <TouchableOpacity
                    style={styles.withdrawButton}
                    onPress={() => handleWithdraw(item)}
                  >
                    <Text style={styles.withdrawText}>THU HỒI</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
              <View style={styles.line} />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Không có lời mời kết bạn đã gửi
              </Text>
            </View>
          }
          style={styles.list}
        />
      );
    };
  }, [loading, refreshing, error, sentRequests, navigation, onRefresh, handleWithdraw, navigateToProfile]);

  // renderScene dạng function, không dùng SceneMap
  const renderScene = useCallback(
    ({ route }) => {
      if (route.key === "received") return renderReceivedTab();
      if (route.key === "sent") return renderSentTab();
      return null;
    },
    [renderReceivedTab, renderSentTab]
  );

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor="#007AFF"
      inactiveColor="gray"
    />
  );


  return (
    <View style={styles.container}>
      <HeadView page={"ReceivedFriendRequests"} />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={renderTabBar}
        style={styles.tabView}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  tabView: {
  },
  tabBar: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f5",
  },
  tabIndicator: {
    backgroundColor: "#007AFF",
    height: 2,
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "none",
  },
  list: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  sectionHeaderText: {
    fontSize: 14,
    color: "#888",
    marginRight: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#f0f2f5",
  },
  requestItem: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 10,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: "flex-start",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  infoWrapper: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  infoContainer: {
    flex: 1,
    marginBottom: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: "#777",
    marginTop: 0,
  },
  timeAgo: {
    fontSize: 12,
    color: "gray",
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  rejectButton: {
    backgroundColor: "#eee",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: "center",
    width: 130,
  },
  rejectText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#555",
  },
  acceptButton: {
    backgroundColor: Color.blueBackgroundButton,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: "center",
    width: 130,
  },
  acceptText: {
    fontSize: 13,
    color: Color.blueText,
    fontWeight: "500",
  },
  withdrawButton: {
    backgroundColor: Color.grayBackgroundButton,
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginLeft: 10,
    marginTop: 15,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  withdrawText: {
    fontSize: 12,
    color: "#000",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "gray",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ReceivedFriendRequests;