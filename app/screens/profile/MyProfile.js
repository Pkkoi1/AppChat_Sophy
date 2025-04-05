import React, { useState, useEffect } from "react"; // Import useEffect
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  AntDesign,
  Feather,
  MaterialIcons,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import AvatarUser from "@/app/components/profile/AvatarUser";
// import { userInfo } from "os"; // Xóa import này
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [refreshing, setRefreshing] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    // Lấy userInfo từ route.params
    if (route.params && route.params.userInfo) {
      setUserInfo(route.params.userInfo);
    }
  }, [route.params]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000); // Giả lập thời gian làm mới 2 giây
  };

  const coverImageHeight = scrollY.interpolate({
    inputRange: [0, 100], // Phạm vi vuốt từ 0 đến 100
    outputRange: [200, 300], // Chiều cao từ 200 đến 300 khi vuốt
    extrapolate: "clamp",
  });

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16} // Cập nhật mượt mà hơn
    >
      <View style={styles.container}>
        <View style={styles.coverContainer}>
          <Animated.Image
            source={require("../../../assets/images/avt.jpg")}
            style={[styles.coverImage, { height: coverImageHeight }]}
          />
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back-ios" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerIcons}>
              <MaterialIcons
                name="manage-history"
                size={24}
                color="#fff"
                style={styles.headerIcon}
              />
              <Icon
                name="more-horiz"
                size={24}
                color="#fff"
                style={styles.headerIcon}
              />
            </View>
          </View>
        </View>

        <View style={styles.overlay}>
          <View style={styles.avatarContainer}>
            <AvatarUser
              fullName={userInfo.fullname}
              width={100}
              height={100}
              avtText={40}
              shadow={true}
              bordered={true}
            />
            <Text style={styles.name}>{userInfo.fullname}</Text>
            <TouchableOpacity>
              <Text style={styles.editText}>Cập nhật giới thiệu bạn thân</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.optionsContainer}
            contentContainerStyle={styles.optionsContent}
          >
            <TouchableOpacity style={styles.optionButton}>
              <MaterialCommunityIcons
                name="account-edit-outline"
                size={22}
                color="#0066cc"
              />
              <Text style={styles.optionText}>Cài zStyle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton}>
              <Icon name="photo" size={22} color="#0066cc" />
              <Text style={styles.optionText}>Ảnh của tôi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton}>
              <Icon name="folder" size={22} color="#128fb0" />
              <Text style={styles.optionText}>Kho khoảnh khắc</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton}>
              <MaterialIcons name="history" size={22} color="#f86f0d" />
              <Text style={styles.optionText}>Kỷ niệm năm xưa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton}>
              <Ionicons name="videocam" size={22} color="#0fdf0f" />
              <Text style={styles.optionText}>Video của tôi</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Status and Button */}
          <View style={styles.statusContainer}>
            <View style={styles.statusIcons}>
              <Image
                source={require("../../../assets/images/profile.jpg")}
                style={styles.statusImage}
              />
            </View>
            <Text style={styles.statusText}>
              Hôm nay Thành Nghiêm có gì vui?{"\n"}
              Đây là Nhất ký của bạn - Hãy làm ngày Nhất ký vui{"\n"}
              hơn nữa nhé, cuộc đời và ký niệm đang chờ nhé!
            </Text>
            <TouchableOpacity style={styles.postButton}>
              <Text style={styles.postButtonText}>Đăng lên Nhất ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverContainer: {
    position: "relative",
    height: 200, // Chiều cao mặc định của ảnh bìa
  },
  coverImage: {
    width: "100%",
    resizeMode: "cover",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    zIndex: 1,
  },
  headerIcons: {
    flexDirection: "row",
  },
  headerIcon: {
    marginLeft: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  scrollViewContent: {},
  avatarContainer: {
    alignItems: "center",
    paddingTop: 20,
    marginTop: -50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#00cc00",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarText: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold",
  },
  name: {
    fontSize: 24,
    color: "#000",
    marginVertical: 10,
    fontWeight: "bold",
  },
  editText: {
    color: "#00aaff",
    marginBottom: 10,
    fontSize: 14,
  },
  optionsContainer: {
    paddingVertical: 10,
    maxHeight: 65,
  },
  optionsContent: {
    paddingHorizontal: 5,
    flexDirection: "row",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  optionText: {
    fontSize: 14,
    color: "#000",
    marginLeft: 10,
    fontWeight: "500",
  },
  statusContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "space-around",
    elevation: 5,
  },
  statusIcons: {
    flexDirection: "row",
    marginBottom: 0,
  },
  statusImage: {
    width: 200,
    height: 200,
    marginHorizontal: 10,
    resizeMode: "contain",
  },
  statusText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
    flex: 1,
  },
  postButton: {
    backgroundColor: "#0066cc",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 100,
  },
  postButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
