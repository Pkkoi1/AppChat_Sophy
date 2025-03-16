import React, { useState, useEffect } from "react";
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
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const UserProfile = ({ route }) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [requestSent, setRequestSent] = useState(null); // Sử dụng null làm giá trị ban đầu

  const { user, requestSent: initialRequestSent } = route.params || {};

  // Cập nhật trạng thái requestSent dựa trên initialRequestSent từ route.params
  useEffect(() => {
    if (initialRequestSent) {
      setRequestSent(initialRequestSent); // Gán trực tiếp giá trị của initialRequestSent ("pending", "accepted", hoặc null)
    }
  }, [initialRequestSent]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const coverImageHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 300],
    extrapolate: "clamp",
  });

  const handleAddFriend = () => {
    navigation.navigate("AddFriend", { user });
  };

  const handleCancelRequest = () => {
    setRequestSent(null); // Hủy yêu cầu, quay lại trạng thái "Kết bạn"
  };

  const handleAcceptRequest = () => {
    navigation.navigate("AcceptFriend", { user });
  }

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
      scrollEventThrottle={16}
    >
      <View style={styles.container}>
        <View style={styles.coverContainer}>
          <Animated.Image
            source={require("../../../../assets/images/avt.jpg")}
            style={[styles.coverImage, { height: coverImageHeight }]}
          />
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back-ios" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerIcons}>
              <Ionicons
                name="call-outline"
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
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>TN</Text>
            </View>
            <Text style={styles.name}>{user?.name || "Thành Nghiêm"}</Text>
            <TouchableOpacity>
              <Text style={styles.editText}>
                Bạn chưa thể xem nhật ký của {user?.name || "Thành Nghiêm"} khi chưa là bạn bè
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            
            {requestSent === "accepted" ? (
              <>
              <TouchableOpacity style={styles.deniedButton}>
                <Text style={styles.deniedButtonText}>Từ chối</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleAcceptRequest}
                style={styles.acceptedButton}>
                <Text style={styles.acceptedButtonText}>Đồng ý</Text>
              </TouchableOpacity>
              </>
            ) : requestSent === "pending" ? (
              <>
                <TouchableOpacity style={styles.messageButton}>
                  <Ionicons name="chatbubble-outline" size={20} color="#0066cc" />
                  <Text style={styles.messageButtonText}>Nhắn tin</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeFriendButton} onPress={handleCancelRequest}>
                  <Ionicons name="person-remove-outline" size={20} color="#666" />
                  <Text style={styles.removeFriendButtonText}>Hủy kết bạn</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
              <TouchableOpacity style={styles.messageButton}>
                  <Ionicons name="chatbubble-outline" size={20} color="#0066cc" />
                  <Text style={styles.messageButtonText}>Nhắn tin</Text>
                </TouchableOpacity>
              <TouchableOpacity style={styles.addFriendButton} onPress={handleAddFriend}>
                <Ionicons name="person-add-outline" size={20} color="#666" />
                <Text style={styles.addFriendButtonText}>Kết bạn</Text>
              </TouchableOpacity>
              </>
              
            )}
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
    height: 200,
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
    paddingTop: 40,
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
  scrollViewContent: {
    flexGrow: 1,
  },
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
    color: "#505050",
    marginBottom: 20,
    fontSize: 14,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6F0FA",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    width: 180,
  },
  messageButtonText: {
    fontSize: 16,
    color: "#0066cc",
    marginLeft: 5,
    fontWeight: "500",
    textAlign: "center",
  },
  addFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: 180,
  },
  removeFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: 180,
  },
  acceptedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
    width: 180,
  },
  deniedButton : {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgb(212, 212, 212)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
    width: 180,
  },
  addFriendButtonText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 5,
    fontWeight: "500",
    textAlign: "center",
  },
  removeFriendButtonText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 5,
    fontWeight: "500",
    textAlign: "center",
  },
  acceptedButtonText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 5,
    fontWeight: "500",
    textAlign: "center",
  },
  deniedButtonText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 5,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default UserProfile;