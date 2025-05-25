import React, { useContext, useState, useEffect } from "react";
import {
  Image,
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from "@expo/vector-icons/Octicons";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { Overlay } from "@rneui/themed";
import { AuthContext } from "@/app/auth/AuthContext";
import AvatarUser from "@/app/components/profile/AvatarUser";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { api } from "@/app/api/api";
import { useNavigateToProfile } from "@/app/utils/profileNavigation";

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
    action: "addMember",
  },
  {
    name: "Đổi\n hình nền",
    icon: <Octicons name="paintbrush" size={20} color="black" />,
    action: "changeBackground",
  },
  {
    name: "Tắt\n thông báo",
    icon: <Ionicons name="notifications-outline" size={20} color="black" />,
  },
];

const ConversationName = ({ receiver, conversation }) => {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [isBackgroundOptionModalVisible, setIsBackgroundOptionModalVisible] =
    useState(false);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isAvatarLoading, setIsAvatarLoading] = useState(false); // loading riêng cho avatar
  const [isRenameLoading, setIsRenameLoading] = useState(false); // loading riêng cho đổi tên
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false); // loading riêng cho nền

  const {
    handlerRefresh,
    updateBackground,
    background,
    setBackground,
    userInfo,
    groupMember,
  } = useContext(AuthContext);
  const navigateToProfile = useNavigateToProfile();

  const isGroupOwnerOrCoOwner = groupMember.some(
    (member) =>
      member.id === userInfo?.userId &&
      (member.role === "owner" || member.role === "co-owner")
  );

  const defaultGroupAvatar = require("../../../../../assets/images/default-group-avatar.jpg");

  const avatarSource = conversation?.isGroup
    ? conversation.groupAvatarUrl
      ? { uri: conversation.groupAvatarUrl }
      : defaultGroupAvatar
    : receiver?.urlavatar
    ? { uri: receiver.urlavatar }
    : null;

  // Khi mở modal đổi tên, set giá trị mặc định là tên hiện tại
  useEffect(() => {
    if (isRenameModalVisible && conversation?.groupName) {
      setNewGroupName(conversation.groupName);
    }
  }, [isRenameModalVisible, conversation?.groupName]);

  const pickImageForAvatar = async () => {
    setIsAvatarLoading(true);
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraPermissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted || !cameraPermissionResult.granted) {
        Alert.alert("Lỗi", "Cần cấp quyền truy cập thư viện ảnh và máy ảnh!");
        setIsAvatarLoading(false);
        return;
      }

      Alert.alert(
        "Chọn nguồn ảnh",
        "Bạn muốn chọn ảnh từ thư viện hay chụp ảnh mới?",
        [
          {
            text: "Thư viện",
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
              });

              if (!result.canceled && result.assets[0].uri) {
                await handleConfirmChangeAvatar(result.assets[0].uri);
              } else {
                setIsAvatarLoading(false);
              }
            },
          },
          {
            text: "Chụp ảnh",
            onPress: async () => {
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
              });

              if (!result.canceled && result.assets[0].uri) {
                await handleConfirmChangeAvatar(result.assets[0].uri);
              } else {
                setIsAvatarLoading(false);
              }
            },
          },
          {
            text: "Hủy",
            style: "cancel",
            onPress: () => setIsAvatarLoading(false),
          },
        ]
      );
    } catch {
      setIsAvatarLoading(false);
    }
  };

  const handleConfirmChangeAvatar = async (imageUri) => {
    setIsAvatarLoading(true);
    try {
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const conversationId = conversation?.conversationId;
      if (!conversationId) {
        throw new Error(
          `Không thể lấy conversationId từ conversation. ${conversation}`
        );
      }

      const response = await api.changeGroupAvatar(
        conversationId,
        `data:image/jpeg;base64,${base64Image}`
      );
      console.log("Đã cập nhật ảnh đại diện nhóm:", response); // Debug thông báo thành công
      console.log("API Response:", response); // Debug giá trị response
      console.log("New Avatar URL:", response?.conversation.groupAvatarUrl); // Debug URL avatar mới

      if (!response?.conversation.groupAvatarUrl) {
        throw new Error("API không trả về groupAvatarUrl hợp lệ");
      }

      Alert.alert("Thành công", "Ảnh đại diện nhóm đã được cập nhật!");
      conversation.groupAvatarUrl = response?.conversation.groupAvatarUrl;
      setSelectedImage(response?.conversation.groupAvatarUrl);
      handlerRefresh();
    } catch (error) {
      console.error(
        "Lỗi khi đổi ảnh đại diện nhóm:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Lỗi",
        "Không thể cập nhật ảnh đại diện nhóm. Vui lòng thử lại."
      );
    } finally {
      setIsAvatarLoading(false);
    }
  };
  const pickImage = async () => {
    // Không dùng setIsLoading(true);
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraPermissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted || !cameraPermissionResult.granted) {
        Alert.alert("Lỗi", "Cần cấp quyền truy cập thư viện ảnh và máy ảnh!");
        return;
      }

      Alert.alert(
        "Chọn nguồn ảnh",
        "Bạn muốn chọn ảnh từ thư viện hay chụp ảnh mới?",
        [
          {
            text: "Thư viện",
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 6],
                quality: 1,
              });

              if (!result.canceled && result.assets[0].uri) {
                setSelectedImage(result.assets[0].uri);
                setIsPreviewModalVisible(true);
              }
            },
          },
          {
            text: "Chụp ảnh",
            onPress: async () => {
              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 6],
                quality: 1,
              });

              if (!result.canceled && result.assets[0].uri) {
                setSelectedImage(result.assets[0].uri);
                setIsPreviewModalVisible(true);
              }
            },
          },
          { text: "Hủy", style: "cancel" },
        ]
      );
    } finally {
      // Không dùng setIsLoading(false);
    }
  };

  const handleConfirmChangeBackground = async () => {
    if (!selectedImage) return;

    setIsBackgroundLoading(true);
    try {
      const base64Image = await FileSystem.readAsStringAsync(selectedImage, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const conversationId = conversation?.conversationId;
      if (!conversationId) {
        throw new Error(
          `Không thể lấy conversationId từ conversation. ${conversation}`
        );
      }

      const response = await api.updateBackground(
        `data:image/jpeg;base64,${base64Image}`,
        conversationId
      );
      await handlerRefresh();
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
      setIsBackgroundLoading(false);
    }
  };

  const handleCancelChangeBackground = () => {
    setIsPreviewModalVisible(false);
    setSelectedImage(null);
  };

  const handleDeleteBackground = async () => {
    console.log("Xóa ảnh nền cuộc trò chuyện");
    setIsBackgroundLoading(true);
    try {
      const conversationId = conversation?.conversationId;
      if (!conversationId) {
        throw new Error(
          `Không thể lấy conversationId từ conversation. ${conversation}`
        );
      }

      updateBackground(null);
      console.log("Đang xóa ảnh nền cuộc trò chuyện:", conversationId);

      await api.removeBackGround(conversationId);
      setBackground(null);
      await handlerRefresh();
      updateBackground(null);

      Alert.alert("Thành công", "Đã xóa ảnh nền cuộc trò chuyện!");
      navigation.goBack();
    } catch (error) {
      console.error(
        "Lỗi khi xóa ảnh nền:",
        error.response?.data || error.message
      );
      Alert.alert("Lỗi", "Không thể xóa ảnh nền. Vui lòng thử lại.");
    } finally {
      setIsBackgroundLoading(false);
    }
  };

  const handleBackgroundOption = () => {
    setIsBackgroundOptionModalVisible(true);
  };

  const closeBackgroundOptionModal = () => {
    setIsBackgroundOptionModalVisible(false);
  };

  const handleRenameGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert("Lỗi", "Tên nhóm không được để trống.");
      return;
    }

    setIsRenameLoading(true);
    try {
      const conversationId = conversation?.conversationId;
      if (!conversationId) {
        throw new Error("Không thể lấy conversationId từ conversation.");
      }

      await api.changeGroupName(conversationId, newGroupName);

      conversation.groupName = newGroupName;

      Alert.alert(
        "Thành công",
        `Tên nhóm đã được đổi thành "${newGroupName}"!`
      );
      setIsRenameModalVisible(false);
      handlerRefresh();
    } catch (error) {
      console.error(
        "Lỗi khi đổi tên nhóm:",
        error.response?.data || error.message
      );
      Alert.alert("Lỗi", "Không thể đổi tên nhóm. Vui lòng thử lại.");
    } finally {
      setIsRenameLoading(false);
    }
  };

  const handlePress = async (option) => {
    if (option.action === "searchMessages") {
      navigation.navigate("Chat", {
        startSearch: true,
        conversation,
        receiver,
      });
    } else if (option.action === "changeBackground") {
      handleBackgroundOption();
    } else if (option.name === "Trang\n cá nhân") {
      try {
        navigateToProfile(navigation, receiver, {
          showLoading: true,
          onLoadingChange: setIsLoading,
        });
      } catch (error) {
        console.error("Error navigating to profile:", error);
        Alert.alert("Lỗi", "Không thể mở trang cá nhân.");
      }
    } else if (option.action === "addMember") {
      navigation.navigate("AddFriendToGroup", { conversation });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {conversation?.isGroup ? (
        <>
          <View style={styles.avatarContainer}>
            {isAvatarLoading ? (
              <ActivityIndicator size="large" color="#1f7bff" />
            ) : (
              <Image
                source={
                  selectedImage
                    ? { uri: selectedImage }
                    : conversation?.isGroup && conversation.groupAvatarUrl
                    ? { uri: conversation.groupAvatarUrl }
                    : defaultGroupAvatar
                }
                style={styles.avatar}
                resizeMode="cover"
              />
            )}
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={pickImageForAvatar}
              disabled={isAvatarLoading}
            >
              <AntDesign name="camerao" size={20} color="black" />
            </TouchableOpacity>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{conversation.groupName}</Text>
            <TouchableOpacity
              style={styles.pencilButton}
              onPress={() => setIsRenameModalVisible(true)}
              disabled={isRenameLoading}
            >
              <EvilIcons name="pencil" size={20} color="black" />
            </TouchableOpacity>
            {isRenameLoading && (
              <ActivityIndicator
                size="small"
                color="#1f7bff"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
        </>
      ) : (
        <>
          <View style={styles.avatarContainer}>
            {receiver?.urlavatar ? (
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
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>
              {receiver?.fullname || "Người dùng không xác định"}
            </Text>
          </View>
        </>
      )}
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

      <Overlay
        isVisible={isPreviewModalVisible}
        onBackdropPress={handleCancelChangeBackground}
        overlayStyle={styles.overlayContent}
      >
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
        {isBackgroundLoading ? (
          <ActivityIndicator size="large" color="#1f7bff" />
        ) : (
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleConfirmChangeBackground}
              disabled={isBackgroundLoading}
            >
              <Text style={styles.modalButtonText}>Đồng ý</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleCancelChangeBackground}
              disabled={isBackgroundLoading}
            >
              <Text style={styles.modalButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        )}
      </Overlay>

      <Overlay
        isVisible={isBackgroundOptionModalVisible}
        onBackdropPress={closeBackgroundOptionModal}
        overlayStyle={styles.overlayContent}
      >
        <Text style={styles.modalText}>Thay đổi hình nền</Text>
        {/* Không dùng isLoading ở đây */}
        <View style={styles.modalButtonContainer}>
          <TouchableOpacity
            style={[styles.modalButton, styles.confirmButton]}
            onPress={() => {
              closeBackgroundOptionModal();
              pickImage();
            }}
          >
            <Text style={styles.modalButtonText}>Chọn hình</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => {
              if (background) {
                handleDeleteBackground();
              }
            }}
            disabled={!background}
          >
            <Text style={styles.modalButtonText}>Xóa hình</Text>
          </TouchableOpacity>
        </View>
      </Overlay>

      <Overlay
        isVisible={isRenameModalVisible}
        onBackdropPress={() => setIsRenameModalVisible(false)}
        overlayStyle={styles.overlayContent}
      >
        <Text style={styles.modalText}>Đổi tên nhóm</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Nhập tên nhóm mới"
          value={newGroupName}
          onChangeText={setNewGroupName}
        />
        {isRenameLoading ? (
          <ActivityIndicator size="large" color="#1f7bff" />
        ) : (
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleRenameGroup}
              disabled={isRenameLoading}
            >
              <Text style={styles.modalButtonText}>Đồng ý</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsRenameModalVisible(false)}
              disabled={isRenameLoading}
            >
              <Text style={styles.modalButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        )}
      </Overlay>
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
  avatarContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center", // Center the loading indicator
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 5,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45, // Make the avatar circular
    marginBottom: 10,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  pencilButton: {
    marginLeft: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 5,
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
  overlayContent: {
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
    backgroundColor: "#d3d3d3",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    marginBottom: 20,
  },
});

export default ConversationName;
