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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ToggleSwitch from "../../../../components/toggle/ToggleSwitch"; // Đảm bảo đường dẫn đúng
import Color from "../../../../components/colors/Color";

const FriendOptions = ({ route }) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [isToggled, setIsToggled] = useState(false);

  const { user } = route.params || {};

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const toggleSwitch = () => {
    setIsToggled(!isToggled);
  };

  const handleDone = () => {
    navigation.goBack(); 
  };

  const handleAcceptFriendship = () => {
    console.log("Đồng ý kết bạn thân công!");
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
          <Text style={styles.headerTitle}>Tùy chọn bạn bè</Text>
          <View style={{ width: 24 }} /> 
        </View>

        <View style={styles.overlay}>
          <View style={styles.avatarContainer}>
            <Image
              source={require("../../../../assets/images/avt.jpg")}
              style={styles.avatar}
            />
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{user?.name}</Text>
              <TouchableOpacity>
                <Ionicons
                  name="create-outline"
                  size={16}
                  color="#666"
                  style={styles.editIcon}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.statusText}>Vừa kết bạn</Text>
          </View>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>Chặn xem nhật ký của tôi</Text>
            <TouchableOpacity onPress={toggleSwitch}>
            <ToggleSwitch isOn={isToggled} onToggle={toggleSwitch} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>XONG</Text>
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
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    position: "relative",
    top: -10,
  },
  name: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
    marginRight: 10,
    
  },
  editIcon: {
    marginTop: 2,
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    position: "absolute",
    bottom: 20,
    left: 90,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#fff",
    paddingVertical: 10,
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
  toggleIcon: {
    transform: [{ rotate: "180deg" }],
  },
  doneButton: {
    backgroundColor: "#0084FF",
    paddingVertical: 12,
    paddingHorizontal: 80,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 20,
    marginHorizontal: 15,
  },
  doneButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  acceptButton: {
    backgroundColor: "#E6E6E6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 20,
    marginHorizontal: 15,
  },
  acceptButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
  },
});

export default FriendOptions;