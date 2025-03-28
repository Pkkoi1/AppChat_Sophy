import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import HeadView from "../../../header/Header";
import receivedRequests from "../../../../../assets/objects/receivedRequests.json";
import sentRequests from "../../../../../assets/objects/sentRequests.json";
import Color from "../../../../components/colors/Color";

const groupByTime = (data) => {
  const today = new Date("2025-03-15T00:00:00Z");
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
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState([
    { key: "received", title: `Đã nhận ${receivedRequests.length}` },
    { key: "sent", title: `Đã gửi ${sentRequests.length}` },
  ]);

  useEffect(() => {
    console.log("Số lượng lời mời đã nhận:", receivedRequests.length);
    console.log("Số lượng lời mời đã gửi:", sentRequests.length);
    console.log("Dữ liệu đã nhận:", receivedRequests);
    console.log("Dữ liệu đã gửi:", sentRequests);
  }, []);

  const handleRequestPress = (item, type) => {
    const requestSent = type === "received" ? "accepted" : "pending";
    navigation.navigate("UserProfile", { user: item, requestSent });
  };

  const handleAccept = (item) => {
    console.log(`Đồng ý kết bạn với ${item.name}`);
    navigation.navigate("AcceptFriend", { user: item });
  };

  const handleReject = (item) => {
    console.log(`Từ chối kết bạn với ${item.name}`);
  };

  const ReceivedTab = () => (
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

  const SentTab = () => (
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
          <TouchableOpacity style={styles.withdrawButton}>
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
});

export default ReceivedFriendRequests;
