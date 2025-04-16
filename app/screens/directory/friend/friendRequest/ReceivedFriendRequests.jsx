import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import HeadView from "../../../header/Header";
import Color from "../../../../components/colors/Color";
// Import API
import api from "../../../../api/api"; // Đảm bảo đường dẫn chính xác

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
  // Thêm state cho dữ liệu từ API
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState([
    { key: "received", title: "Đã nhận" },
    { key: "sent", title: "Đã gửi" },
  ]);

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const receivedData = await api.getFriendRequestsReceived();
        const sentData = await api.getFriendRequestsSent();
        
        setReceivedRequests(receivedData);
        setSentRequests(sentData);
        
        // Cập nhật routes với số lượng 
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

  // Debug
  useEffect(() => {
    console.log("Số lượng lời mời đã nhận:", receivedRequests.length);
    console.log("Số lượng lời mời đã gửi:", sentRequests.length);
  }, [receivedRequests, sentRequests]);

  const handleRequestPress = (item, type) => {
    const requestSent = type === "received" ? "accepted" : "pending";
    navigation.navigate("UserProfile", { user: item, requestSent });
  };

  // Cập nhật xử lý sự kiện với API
  const handleAccept = async (item) => {
    try {
      await api.acceptFriendRequest(item.id);
      // Cập nhật UI sau khi thành công
      setReceivedRequests(prevRequests => 
        prevRequests.filter(request => request.id !== item.id)
      );
      console.log(`Đồng ý kết bạn với ${item.name}`);
      navigation.navigate("AcceptFriend", { user: item });
    } catch (err) {
      console.error("Lỗi khi chấp nhận lời mời kết bạn:", err);
    }
  };

  const handleReject = async (item) => {
    try {
      await api.rejectFriendRequest(item.id);
      // Cập nhật UI sau khi thành công
      setReceivedRequests(prevRequests => 
        prevRequests.filter(request => request.id !== item.id)
      );
      console.log(`Từ chối kết bạn với ${item.name}`);
    } catch (err) {
      console.error("Lỗi khi từ chối lời mời kết bạn:", err);
    }
  };

  const handleWithdraw = async (item) => {
    try {
      await api.retrieveFriendRequest(item.id);
      // Cập nhật UI sau khi thành công
      setSentRequests(prevRequests => 
        prevRequests.filter(request => request.id !== item.id)
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.requestItem}
            onPress={() => handleRequestPress(item, "received")}
          >
            <Image
              source={require("../../../../../assets/images/avt.jpg")}
              style={styles.avatar}
            />
            <View style={styles.infoWrapper}>
              <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.status}>{item.status || "Muốn kết bạn"}</Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleReject(item)}
                >
                  <Text style={styles.rejectText}>TỪ CHỐI</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAccept(item)}
                >
                  <Text style={styles.acceptText}>ĐỒNG Ý</Text>
                </TouchableOpacity>
              </View>
            </View>
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
        keyExtractor={(item) => item.id}
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
            <Text style={styles.emptyText}>Không có lời mời đã gửi</Text>
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
    backgroundColor: "#fff",
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
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  sectionHeaderText: {
    fontSize: 14,
    color: "gray",
    marginRight: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#f0f2f5",
  },
  requestItem: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
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
  },
  infoContainer: {
    flex: 1,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  status: {
    fontSize: 12,
    color: "gray",
    marginTop: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: "gray",
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
  },
  rejectButton: {
    backgroundColor: Color.grayBackgroundButton,
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  rejectText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  acceptButton: {
    backgroundColor: Color.blueBackgroundButton,
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  acceptText: {
    fontSize: 12,
    color: Color.blueText,
    fontWeight: "bold",
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