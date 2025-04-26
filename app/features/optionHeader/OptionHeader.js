import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SocketContext } from "@/app/socket/SocketContext";

const OptionHeader = ({ title, previousScreen }) => {
  const navigation = useNavigation();
  const socket = useContext(SocketContext);

  const handleGoBack = () => {
    if (previousScreen) {
      navigation.navigate(previousScreen); // Quay lại màn hình trước với dữ liệu
    } else {
      socket.on("newMessage");
      socket.on("groupAvatarChanged");
      socket.on("groupNameChanged");
      socket.on("userJoinedGroup");
      socket.on("userAddedToGroup");
      socket.on("userLeftGroup");
      socket.on("userRemovedFromGroup");
      socket.on("groupOwnerChanged");
      socket.on("groupCoOwnerAdded");
      socket.on("groupCoOwnerRemoved");
      socket.on("groupDeleted");
      socket.on("userBlocked");
      socket.on("userUnblocked");
      navigation.goBack(); // Quay lại màn hình trước mặc định
    }
  };

  return (
    <LinearGradient
      colors={["#1f7bff", "#12bcfa"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="white"
          onPress={handleGoBack}
        />
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {},
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    shadowColor: "#000", // Màu của bóng
    shadowOffset: { width: 0, height: 2 }, // Độ lệch của bóng
    shadowOpacity: 0.2, // Độ mờ của bóng
    shadowRadius: 4, // Bán kính của bóng
    elevation: 5, // Độ cao (chỉ dành cho Android)
    zIndex: 20, // Đảm bảo gradient nằm trên các thành phần khác
  },
  headerTitle: {
    fontSize: 15,
    color: "#fff",
    marginLeft: 10,
    fontWeight: "600",
  },
});

export default OptionHeader;
