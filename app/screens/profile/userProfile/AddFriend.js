import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ToggleSwitch from "../../../../components/toggle/ToggleSwitch"; // Đảm bảo đường dẫn đúng

const AddFriend = ({ route }) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [isToggled, setIsToggled] = useState(false);

  const { user } = route.params || {};
  const senderName = "Thành Nghiêm"; 
  const wordLimit = "94/150"; 

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const toggleSwitch = () => {
    setIsToggled(!isToggled);
  };

  const handleSendRequest = () => {
    // Quay về trang UserProfile và cập nhật trạng thái nút
    navigation.navigate("UserProfile", { user, requestSent: "pending" });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back-ios" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kết bạn</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.overlay}>
          <View style={styles.avatarContainer}>
            <Image
              source={require("../../../../assets/images/avt.jpg")}
              style={styles.avatar}
            />
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{user?.name || "Đăng Khôi"}</Text>
              <TouchableOpacity>
                <Ionicons
                  name="create"
                  size={20}
                  color="#666"
                  style={styles.editIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.requestInfo}>
            <Text style={styles.requestText}>
              Xin chào, mình là {senderName}. Thấy bạn trong nhóm chụp hình nên mình muốn kết bạn!
            </Text>
            <View style={styles.requestDetails}>
              <Text style={styles.wordLimit}>{wordLimit}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton}>
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>Chặn xem nhật ký của tôi</Text>
            <ToggleSwitch isOn={isToggled} onToggle={toggleSwitch} />
          </View>
          <TouchableOpacity style={styles.sendRequestButton} onPress={handleSendRequest}>
            <Text style={styles.sendRequestText}>Gửi yêu cầu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0084FF",
    padding: 15,
    paddingTop: 20,  
    elevation: 4,  
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    paddingTop: 20,
    paddingBottom: 20,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start", 
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
    marginRight: 5,
  },
  editIcon: {
    marginLeft: 5,
  },
  requestInfo: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requestText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 20,
    paddingRight: 30,
  },
  requestDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  wordLimit: {
    fontSize: 12,
    color: "#666",
    position: "absolute",
    right: 0,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  toggleContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    color: "#333",
  },
  sendRequestButton: {
    backgroundColor: "#0084FF",
    paddingVertical: 12,
    paddingHorizontal: 80,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 20,
    marginHorizontal: 15,
  },
  sendRequestText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default AddFriend;