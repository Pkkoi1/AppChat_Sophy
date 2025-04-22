import React, { useContext, useState } from "react";
import {
  Image,
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Button,
  Alert,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from "@expo/vector-icons/Octicons";
import { AuthContext } from "@/app/auth/AuthContext";
import AvatarUser from "@/app/components/profile/AvatarUser";
import * as ImagePicker from "expo-image-picker"; // Thêm expo-image-picker
import * as FileSystem from "expo-file-system"; // Thêm expo-file-system để chuyển ảnh sang base64
import { api } from "@/app/api/api"; // Nhập API

const options = [
  {
    name: "Tìm\n tin nhắn",
    icon: <AntDesign name="search1" size={20} color="black" />,
    action: "searchMessages",
  },
  {
    name: "Trang\n cá nhân",
    icon: <AntDesign name="user" size={20} color="black" />,
    showIfGroup: false,
  },
  {
    name: "Thêm\n thành viên",
    icon: <AntDesign name="adduser" size={20} color="black" />,
    showIfGroup: true,
  },
  {
    name: "Đổi\n hình nền",
    icon: <Octicons name="paintbrush" size={20} color="black" />,
    action: "changeBackground", // Thêm action cho đổi hình nền
  },
  {
    name: "Tắt\n thông báo",
    icon: <Ionicons name="notifications-outline" size={20} color="black" />,
  },
];

const ConversationName = ({ receiver, conversation }) => {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null); // Lưu URI ảnh đã chọn
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false); // Trạng thái modal xem trước
  const [isBackgroundOptionModalVisible, setIsBackgroundOptionModalVisible] =
    useState(false); // Modal trạng thái chọn hình/xóa hình
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const { handlerRefresh, updateBackground, background } =
    useContext(AuthContext); // Use handlerRefresh from AuthContext

  const defaultGroupAvatar = require("../../../../../assets/images/default-group-avatar.jpg");

  const avatarSource = conversation?.isGroup
    ? conversation.groupAvatarUrl
      ? { uri: conversation.groupAvatarUrl }
      : defaultGroupAvatar
    : receiver?.urlavatar
    ? { uri: receiver.urlavatar }
    : null;

  // Hàm mở thư viện chọn ảnh
  const pickImage = async () => {
    setIsLoading(true); // Bắt đầu loading
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Lỗi", "Cần cấp quyền truy cập thư viện ảnh!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 6],

        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        setSelectedImage(result.assets[0].uri);
        setIsPreviewModalVisible(true); // Mở modal xem trước
      }
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  // Hàm xử lý xác nhận đổi hình nền
  const handleConfirmChangeBackground = async () => {
    if (!selectedImage) return;

    setIsLoading(true); // Bắt đầu loading
    try {
      // Chuyển ảnh sang base64
      const base64Image = await FileSystem.readAsStringAsync(selectedImage, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const conversationId = conversation?.conversationId;
      if (!conversationId) {
        throw new Error(
          `Không thể lấy conversationId từ conversation. ${conversation}`
        );
      }

      // Gọi API updateBackground
      const response = await api.updateBackground(
        `data:image/jpeg;base64,${base64Image}`, // Ensure proper formatting
        conversationId
      );
      await handlerRefresh(); // Refresh the conversation list after updating background
      Alert.alert("Thành công", "Đã cập nhật ảnh nền cuộc trò chuyện!");
      setIsPreviewModalVisible(false);
      setSelectedImage(null);
      updateBackground(response.conversation.background);
      navigation.goBack();
    } catch (error) {
      console.error(
        "Lỗi khi đổi ảnh nền:",
        error.response?.data || error.message
      );
      Alert.alert("Lỗi", "Không thể cập nhật ảnh nền. Vui lòng thử lại.");
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  // Hàm xử lý hủy đổi ảnh
  const handleCancelChangeBackground = () => {
    setIsPreviewModalVisible(false);
    setSelectedImage(null);
  };

  const handleDeleteBackground = async () => {
    setIsLoading(true); // Bắt đầu loading
    try {
      const conversationId = conversation?.conversationId;
      if (!conversationId) {
        throw new Error(
          `Không thể lấy conversationId từ conversation. ${conversation}`
        );
      }

      // Gọi API để xóa hình nền
      updateBackground(null); // Cập nhật lại hình nền

      await api.removeBackGround(conversationId);
      await handlerRefresh(); // Refresh the conversation list after deleting background
      updateBackground(null); // Cập nhật lại hình nền

      Alert.alert("Thành công", "Đã xóa ảnh nền cuộc trò chuyện!");
      navigation.goBack();
    } catch (error) {
      console.error(
        "Lỗi khi xóa ảnh nền:",
        error.response?.data || error.message
      );
      Alert.alert("Lỗi", "Không thể xóa ảnh nền. Vui lòng thử lại.");
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  const handleBackgroundOption = () => {
    setIsBackgroundOptionModalVisible(true); // Hiển thị modal chọn hình/xóa hình
  };

  const closeBackgroundOptionModal = () => {
    setIsBackgroundOptionModalVisible(false); // Đóng modal
  };

  const handlePress = (option) => {
    if (option.action === "searchMessages") {
      navigation.navigate("Chat", {
        startSearch: true,
        conversation,
        receiver,
      });
    } else if (option.action === "changeBackground") {
      handleBackgroundOption(); // Hiển thị modal chọn hình/xóa hình
    } else if (option.name === "Trang\n cá nhân") {
      navigation.navigate("UserProfile", {
        friend: receiver,
        requestSent: "friend",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {conversation?.isGroup ? (
        <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
      ) : receiver?.urlavatar ? (
        <Image
          source={{ uri: receiver.urlavatar }}
          style={styles.avatar}
          resizeMode="cover"
        />
      ) : (
        <AvatarUser
          fullName={receiver?.fullname || "Người dùng không xác định"}
          width={90}
          height={90}
          avtText={30}
          shadow={false}
          bordered={false}
        />
      )}
      <Text style={styles.name}>
        {conversation?.isGroup ? conversation.groupName : receiver?.fullname}
      </Text>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          if (
            (conversation?.isGroup && option.showIfGroup === false) ||
            (!conversation?.isGroup && option.showIfGroup === true)
          ) {
            return null;
          }
          return (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => handlePress(option)}
            >
              <View style={styles.optionIcon}>{option.icon}</View>
              <Text style={styles.optionText}>{option.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Modal xem trước ảnh */}
      <Modal
        visible={isPreviewModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelChangeBackground}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
            <Text style={styles.modalText}>
              Bạn có muốn sử dụng ảnh này làm hình nền?
            </Text>
            {isLoading ? ( // Hiển thị spinner khi đang loading
              <ActivityIndicator size="large" color="#1f7bff" />
            ) : (
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleConfirmChangeBackground}
                >
                  <Text style={styles.modalButtonText}>Đồng ý</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCancelChangeBackground}
                >
                  <Text style={styles.modalButtonText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal chọn hành động */}
      <Modal
        visible={isBackgroundOptionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeBackgroundOptionModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Thay đổi hình nền</Text>
            {isLoading ? ( // Hiển thị spinner khi đang loading
              <ActivityIndicator size="large" color="#1f7bff" />
            ) : (
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    isLoading && styles.disabledButton, // Disable button during loading
                  ]}
                  onPress={() => {
                    if (!isLoading) {
                      closeBackgroundOptionModal();
                      pickImage(); // Mở thư viện chọn ảnh
                    }
                  }}
                  disabled={isLoading} // Disable button during loading
                >
                  <Text style={styles.modalButtonText}>Chọn hình</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.cancelButton,
                    (!background || isLoading) && styles.disabledButton, // Disable if no background or during loading
                  ]}
                  onPress={() => {
                    if (!isLoading && background) {
                      // closeBackgroundOptionModal();
                      handleDeleteBackground(); // Xóa hình nền
                    }
                  }}
                  disabled={!background || isLoading} // Disable if no background or during loading
                >
                  <Text style={styles.modalButtonText}>Xóa hình</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 0,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
  },
  optionsContainer: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  option: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 15,
  },
  optionText: {
    fontSize: 11,
    textAlign: "center",
  },
  optionIcon: {
    borderRadius: 50,
    padding: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#1f7bff",
  },
  cancelButton: {
    backgroundColor: "#ff3b30",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButton: {
    backgroundColor: "#d3d3d3", // Màu xám khi bị vô hiệu hóa
  },
});

export default ConversationName;
