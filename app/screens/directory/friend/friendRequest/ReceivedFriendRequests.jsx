import React, { useState, useEffect, useContext } from "react";
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

const groupByTime = (data) => {
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setDate(today.getDate() - 30);

  const sections = {};

  data.forEach((item) => {
    const itemDate = new Date(item.timestamp);
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
      const dateA = new Date(a.data[0].timestamp);
      const dateB = new Date(b.data[0].timestamp);
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
  const [routes, setRoutes] = useState([
    { key: "received", title: "Đã nhận" },
    { key: "sent", title: "Đã gửi" },
  ]);

  const socket = useContext(SocketContext);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const receivedData = await api.getFriendRequestsReceived();
      const sentData = await api.getFriendRequestsSent();

      setReceivedRequests(receivedData);
      setSentRequests(sentData);

      setRoutes([
        { key: "received", title: `Đã nhận ${receivedData.length}` },
        { key: "sent", title: `Đã gửi ${sentData.length}` },
      ]);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu lời mời kết bạn:", err);
      setError("Không thể tải dữ liệu lời mời kết bạn");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const receivedData = await api.getFriendRequestsReceived();
        const sentData = await api.getFriendRequestsSent();

        setReceivedRequests(receivedData);
        setSentRequests(sentData);

        console.log("Received Requests:", receivedRequests);

        setRoutes([
          { key: "received", title: `Đã nhận ${receivedData.length}` },
          { key: "sent", title: `Đã gửi ${sentData.length}` },
        ]);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu lời mời kết bạn:", err);
        setError("Không thể tải dữ liệu lời mời kết bạn");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log("Số lượng lời mời đã nhận:", receivedRequests.length);
    console.log("Số lượng lời mời đã gửi:", sentRequests.length);
  }, [receivedRequests, sentRequests]);

  useEffect(() => {
    if (!socket) return;
    const updateRoutes = (received, sent) => {
      setRoutes([
        { key: "received", title: `Đã nhận ${received.length}` },
        { key: "sent", title: `Đã gửi ${sent.length}` },
      ]);
    };
    //  {"friendRequestId": "fr7792672504185546", 
    // "message": "Xin chào, mình là Phan Hoàng Tân. Kết bạn với mình nhé!", 
    // "sender": {"avatar": "https://res.cloudinary.com/dyd5381vx/image/upload/v1744651198/avatars/cdfxytyx8tv96wpxwe9o.jpg", 
                // "fullname": "Phan Hoàng Tân", 
                // "userId": "user779030103"}, 
                // "timestamp": "2025-04-17T18:55:46.724Z"}
    const handleNewFriendRequest = (data) => {
      console.log("SOCKET newFriendRequest:", data); // Xem dữ liệu thực tế
      setReceivedRequests(prev => [data, ...prev]);
    };

    const handleRejectedFriendRequest = ({ friendRequestData }) => {
      setSentRequests((prev) =>
        prev.filter((req) => req.friendRequestId !== friendRequestData.friendRequestId)
      );
    };

    const handleAcceptedFriendRequest = ({ friendRequestData }) => {
      setSentRequests((prev) =>
        prev.filter((req) => req.friendRequestId !== friendRequestData.friendRequestId)
      );
    };

    const handleRetrievedFriendRequest = ({ friendRequestData }) => {
      setReceivedRequests((prev) =>
        prev.filter((req) => req.friendRequestId !== friendRequestData.friendRequestId)
      );
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

  const handleRequestPress = (item, type) => {
    const requestSent = type === "received" ? "accepted" : "pending";
    navigation.navigate("UserProfile", { user: item, requestSent });
  };

  const handleAccept = async (item) => {
    try {
      setLoading(true);
      console.log("ACCEPTED.friendRequestId:", item); // Kiểm tra giá trị của friendRequestId
      await api.acceptFriendRequest(item.friendRequestId);
      setReceivedRequests((prevRequests) =>
        prevRequests.filter((request) => request.friendRequestId !== item.friendRequestId)
      );
      console.log(`Đồng ý kết bạn với ${item.sender.fullname}`);
      Alert.alert("Thành công", `Đã chấp nhận lời mời kết bạn từ ${item.sender.fullname}`);
    } catch (err) {
      console.error("Lỗi khi chấp nhận lời mời kết bạn:", err);
      Alert.alert("Lỗi", "Không thể chấp nhận lời mời kết bạn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (item) => {
    try {
      setLoading(true);
      console.log("REJECT.friendRequestId:", item); // Kiểm tra giá trị của friendRequestId
      await api.rejectFriendRequest(item.friendRequestId);
      setReceivedRequests((prevRequests) =>
        prevRequests.filter((request) => request.friendRequestId !== item.friendRequestId)
      );
      console.log(`Từ chối kết bạn với ${item.sender.fullname}`);
      Alert.alert("Thành công", `Đã từ chối lời mời kết bạn từ ${item.sender.fullname}`);
    } catch (err) {
      console.error("Lỗi khi từ chối lời mời kết bạn received :", err);
      Alert.alert("Lỗi", "Không thể từ chối lời mời kết bạn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (item) => {
    try {
      await api.retrieveFriendRequest(item.userId);
      setSentRequests((prevRequests) =>
        prevRequests.filter((request) => request.userId !== item.userId)
      );
      console.log(`Đã thu hồi lời mời kết bạn với ${item.name}`);
    } catch (err) {
      console.error("Lỗi khi thu hồi lời mời kết bạn:", err);
    }
  };

  const ReceivedTab = () => {
    if (loading) {
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
        keyExtractor={(item) => item.friendRequestId}
        // console log the item to see its structure
        renderItem={({ item }) => {
          // Ưu tiên lấy sender, fallback sang senderId nếu có
          const user = item.sender || item.senderId;
          // {"friendRequestId": "fr7792672504183225", 
          // "message": "Xin chào, mình là Phan Hoàng Tân. Kết bạn với mình nhé!"
          // sender:
            // "birthday": "2003-08-12", 
            // "fullname": "Phan Hoàng Tân", 
            // "isMale": true, "phone": "0123456779", 
            // "urlavatar": "https://res.cloudinary.com/dyd5381vx/image/upload/v1744651198/avatars/cdfxytyx8tv96wpxwe9o.jpg", 
            // "userId": "user779030103"}
          console.log("Received item:", item); // Kiểm tra dữ liệu thực tế
          return (
            <TouchableOpacity
              style={styles.requestItem}
              onPress={() => {
                navigation.navigate("UserProfile", {
                  friend: user,
                  requestSent: "accepted",
                });
              }}
            >
              <Image
                source={{ uri: user?.avatar || user?.urlavatar }}
                style={styles.avatar}
              />
              <View style={styles.infoWrapper}>
                <Text style={styles.name}>{user?.fullname}</Text>
                <Text style={styles.status}>{"Muốn kết bạn"}</Text>
                <View style={styles.buttonContainer}>
                  {loading ? (
                    <ActivityIndicator size="small" color={Color.blueBackgroundButton} />
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
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

  const SentTab = () => {
    if (loading) {
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
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.requestItem}
            onPress={() => handleRequestPress(item, "sent")}
          >
            <Image
              source={require("../../../../../assets/images/avt.jpg")}
              style={styles.avatar}
            />
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.status}>{item.status}</Text>
              <Text style={styles.timeAgo}>{item.timeAgo}</Text>
            </View>
            <TouchableOpacity 
              style={styles.withdrawButton}
              onPress={() => handleWithdraw(item)}
            >
              <Text style={styles.withdrawText}>THU HỒI</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
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

  const renderScene = SceneMap({
    received: ReceivedTab,
    sent: SentTab,
  });

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
    marginTop: 10,
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