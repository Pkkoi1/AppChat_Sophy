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

const Discover = () => {
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useState(new Animated.Value(0))[0]; // Theo dõi vị trí cuộn

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
      bounces={true} // Bật hiệu ứng giãn tự nhiên
      overScrollMode="always" // Cho phép kéo giãn trên Android
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16} // Tối ưu hóa hiệu ứng khi cuộn
    >
      <Animated.View style={{ transform: [{ translateY }] }}>
        <TouchableOpacity style={[styles.item, styles.group1]}>
          <View style={styles.itemContent}>
            <View style={styles.iconWrapper}>
              <AntDesign name="playcircleo" size={24} color="#00C4FF" />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.itemTitle}>Zalo Video</Text>
              <Text style={styles.itemDescription}>
                [Xem nhiều] Quảng châu - thuộc tỉnh Quảng...
              </Text>
            </View>
          </View>
          <View style={styles.imageContainer}>
            <Image
              source={require("../../../assets/images/avt.jpg")}
              style={{ width: 40, height: 40, borderRadius: 5 }}
            />
            <View style={styles.redDot} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.item, styles.group2]}>
          <View style={styles.itemContent}>
            <View style={styles.iconWrapper}>
              <AntDesign name="rocket1" size={24} color="#FF5722" />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.itemTitle}>Game Center</Text>
            </View>
          </View>
          <AntDesign name="right" size={16} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.item, styles.group3]}>
          <View style={styles.itemContent}>
            <View style={styles.iconWrapper}>
              <AntDesign name="calendar" size={24} color="#4CAF50" />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.itemTitle}>Tiện ích đời sống</Text>
              <Text style={styles.itemDescription}>
                Nạp điện thoại, Dò vé số, Lịch bóng đá, ...
              </Text>
            </View>
          </View>
          <AntDesign name="right" size={16} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.item, styles.group4]}>
          <View style={styles.itemContent}>
            <View style={styles.iconWrapper}>
              <AntDesign name="menuunfold" size={24} color="#FFC107" />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.itemTitle}>Tiện ích tài chính</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.item, styles.group5]}>
          <View style={styles.itemContent}>
            <View style={styles.iconWrapper}>
              <AntDesign name="home" size={24} color="#9C27B0" />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.itemTitle}>Dịch vụ công tỉnh Long An</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.item, styles.group6]}>
          <View style={styles.itemContent}>
            <View style={styles.iconWrapper}>
              <AntDesign name="appstore-o" size={24} color="#0068FF" />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.itemTitle}>Mini App</Text>
              <Text style={styles.itemDescription}>
                Quản lý tài khoản và bảo mật
              </Text>
            </View>
          </View>
          <AntDesign name="right" size={16} color="#000" />
        </TouchableOpacity>

        {/* Thêm khoảng trống để đảm bảo cuộn ở mọi nơi */}
        <View style={styles.paddingBottom} />
      </Animated.View>
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
    borderBottomWidth: 10,
    borderBottomColor: "#f0f0f0", // Sửa lỗi borderBlockColor thành borderBottomColor
  },
  group2: {
    borderBottomWidth: 10,
    borderBottomColor: "#f0f0f0",
  },
  group3: {
    borderBottomWidth: 10,
    borderBottomColor: "#f0f0f0",
  },
  group4: {
    borderBottomWidth: 10,
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