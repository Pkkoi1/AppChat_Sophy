import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const Discover = () => {
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useState(new Animated.Value(0))[0]; // Theo dõi vị trí cuộn
  const navigation = useNavigation();

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  // Hiệu ứng giãn khi kéo
  const translateY = scrollY.interpolate({
    inputRange: [-200, 0, 200], // Khoảng cuộn từ -200 đến 200 (khi kéo quá giới hạn)
    outputRange: [100, 0, -100], // Giãn nội dung lên 100px khi kéo lên, -100px khi kéo xuống
    extrapolate: "clamp",
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      bounces={true}
      overScrollMode="always"
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      {/* Nút mở trợ lý AI */}
      <TouchableOpacity
        style={[styles.item]}
        onPress={() => navigation.navigate("AiAssistantChatList")}
      >
        <View style={styles.itemContent}>
          <View style={styles.iconWrapper}>
            <Image
              source={require("../../../assets/images/AI.png")}
              style={{ width: 32, height: 32, borderRadius: 16 }}
            />
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.itemTitle}>Trợ lý AI Sophy</Text>
            <Text style={styles.itemDescription}>
              Nhắn tin với trợ lý AI thông minh
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      {/* ...existing code... */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    marginRight: 15,
  },
  textWrapper: {
    flex: 1,
    paddingLeft: 15,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemDescription: {
    fontSize: 12,
    color: "#777",
  },
  imageContainer: {
    position: "relative",
  },
  redDot: {
    width: 10,
    height: 10,
    backgroundColor: "red",
    borderRadius: 5,
    position: "absolute",
    top: -2,
    right: -2,
  },
  group1: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0", // Sửa lỗi borderBlockColor thành borderBottomColor
  },
  group2: {
    borderBottomWidth: 10,
    borderBottomColor: "#f0f0f0",
  },
  group3: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  group4: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  group5: {
    borderBottomWidth: 10,
    borderBottomColor: "#f0f0f0",
  },
  group6: {
    borderBottomWidth: 10,
    borderBottomColor: "#f0f0f0",
  },
  paddingBottom: {
    height: 251, // Thêm khoảng trống để đảm bảo cuộn
  },
});

export default Discover;
