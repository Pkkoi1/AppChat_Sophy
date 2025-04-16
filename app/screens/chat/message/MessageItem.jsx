import React, { useContext, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

import MessageItemStyle from "./MessageItemStyle";
import HighlightText from "../../../components/highlightText/HighlightText";
import AvatarUser from "@/app/components/profile/AvatarUser";
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
import * as Sharing from "expo-sharing";
import { AuthContext } from "@/app/auth/AuthContext";
const errorImage =
  "https://res.cloudinary.com/dyd5381vx/image/upload/v1744732824/z6509003496600_0f4526fe7c8ca476fea6dddff2b3bc91_d4nysj.jpg";

const convertToEnglish = (char) => {
  const vietnameseMap = {
    Ă: "A",
    Â: "A",
    Á: "A",
    À: "A",
    Ả: "A",
    Ã: "A",
    Ạ: "A",
    Đ: "D",
    Ê: "E",
    É: "E",
    È: "E",
    Ẻ: "E",
    Ẽ: "E",
    Ẹ: "E",
    Í: "I",
    Ì: "I",
    Ỉ: "I",
    Ĩ: "I",
    Ị: "I",
    Ô: "O",
    Ơ: "O",
    Ó: "O",
    Ò: "O",
    Ỏ: "O",
    Õ: "O",
    Ọ: "O",
    Ú: "U",
    Ù: "U",
    Ủ: "U",
    Ũ: "U",
    Ụ: "U",
    Ư: "U",
    Ý: "Y",
    Ỳ: "Y",
    Ỷ: "Y",
    Ỹ: "Y",
    Ỵ: "Y",
  };
  return vietnameseMap[char] || char;
};

const getColorForInitial = (initial) => {
  const char = convertToEnglish(initial).toUpperCase();
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 69) return "#2e5389";
  if (code >= 70 && code <= 74) return "#2b7155";
  if (code >= 75 && code <= 79) return "#009688";
  if (code >= 80 && code <= 84) return "#3D2F00";
  if (code >= 85 && code <= 90) return "#AD8500";
  return "#B0B0B0";
};

const MessageItem = ({
  message,
  isSender,
  searchQuery,
  isHighlighted,
  receiver,
  isFirstMessageFromSender,
}) => {
  const { userInfo } = useContext(AuthContext);

  const navigation = useNavigation();
  const isGroup = !receiver;
  const [senders, setSenders] = useState([]);
  const formattedTime = moment(message.createdAt).format("HH:mm");

  useEffect(() => {
    const loadSender = async () => {
      try {
        const user = await fetchUserInfo(message.senderId);
        if (user) {
          setSenders((prev) => [...prev, user]);
        }
      } catch (err) {
        console.error("Error loading sender info:", err);
      }
    };

    if (message.senderId) {
      loadSender();
    }
  }, [message.senderId]);

  const getSenderInfo = () =>
    senders.find((s) => s.userId === message.senderId);

  if (message.hiddenFrom?.includes(userInfo.userId)) {
    return null; // Do not render the message if hiddenFrom contains the user's ID
  }

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const path = FileSystem.cacheDirectory + fileName;
      const res = FileSystem.createDownloadResumable(fileUrl, path);
      const { uri } = await res.downloadAsync();

      if (!uri) throw new Error("Không thể tải file");

      const extension = fileName.split(".").pop()?.toLowerCase();

      // Nếu là media thì dùng MediaLibrary
      if (["jpg", "jpeg", "png", "mp4", "mp3"].includes(extension)) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          return Alert.alert("Từ chối truy cập", "Không thể lưu file media.");
        }

        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync("Download", asset, false);

        Alert.alert("Thành công", "File media đã lưu vào thư viện.");
      } else {
        // Nếu không phải media: PDF, Word, Excel, ZIP,...
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert("Đã tải", `File đã lưu vào: ${uri}`);
        }
      }
    } catch (err) {
      console.error("Download error:", err);
      Alert.alert("Lỗi", "Tải file thất bại.");
    }
  };

  const renderFileIcon = (type) => {
    if (type.includes("pdf"))
      return <FontAwesome5 name="file-pdf" size={24} color="#d9534f" />;
    if (type.includes("word"))
      return <FontAwesome5 name="file-word" size={24} color="#007bff" />;
    if (type.includes("excel"))
      return <FontAwesome5 name="file-excel" size={24} color="#28a745" />;
    if (type.includes("zip"))
      return <FontAwesome5 name="file-archive" size={24} color="#f0ad4e" />;
    return <MaterialIcons name="insert-drive-file" size={24} color="#6c757d" />;
  };

  const renderAvatar = () => {
    const user = getSenderInfo();
    const fullName = user?.fullname || receiver?.fullname || "User";
    const url = user?.urlavatar || receiver?.urlavatar;

    return url ? (
      <Image source={{ uri: url }} style={MessageItemStyle.avatar} />
    ) : (
      <AvatarUser
        fullName={fullName}
        width={32}
        height={32}
        avtText={12}
        shadow={false}
        bordered={false}
      />
    );
  };

  const renderSenderName = () => {
    if (isGroup && !isSender) {
      const user = getSenderInfo();
      const name = user?.fullname || "User";
      const color = getColorForInitial(name.charAt(0));
      return (
        <Text style={[MessageItemStyle.senderName, { color }]}>{name}</Text>
      );
    }
    return null;
  };

  const renderContent = () => {
    const { type, content, attachment, isRecall } = message;

    if (isRecall) {
      return (
        <Text style={MessageItemStyle.recalledMessage}>
          Tin nhắn đã được thu hồi
        </Text>
      );
    }

    switch (type) {
      case "text":
        return (
          <HighlightText
            text={content}
            highlight={searchQuery}
            style={MessageItemStyle.content}
          />
        );
      case "image":
        const imageUrl = attachment?.url || errorImage;
        return (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("FullScreenImageViewer", { imageUrl })
            }
          >
            <Image source={{ uri: imageUrl }} style={MessageItemStyle.image} />
          </TouchableOpacity>
        );
      case "file":
        const fileUrl = attachment?.url;
        const fileName = attachment?.name || "Tệp tin";
        const fileType = attachment?.type || "unknown";

        return (
          <View style={MessageItemStyle.fileContainer}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              {renderFileIcon(fileType)}
              <Text style={MessageItemStyle.fileName}>{fileName}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDownload(fileUrl, fileName)}
              style={MessageItemStyle.downloadButton}
            >
              <Text style={MessageItemStyle.downloadButtonText}>Tải xuống</Text>
            </TouchableOpacity>
          </View>
        );
      case "video":
        return (
          <View>
            <Text style={MessageItemStyle.videoLabel}>Video:</Text>
            <Video
              source={{ uri: attachment?.url }}
              style={MessageItemStyle.video}
              resizeMode="contain"
              controls
            />
          </View>
        );
      default:
        return (
          <Text style={MessageItemStyle.unsupported}>
            Không hỗ trợ loại tin nhắn này
          </Text>
        );
    }
  };

  const renderStatus = () => {
    if (!isSender || !isFirstMessageFromSender) return null;

    let text = "Đã gửi";
    if (receiver && message.readBy?.some((u) => u.userId === receiver.userId)) {
      text = "Đã xem";
    } else if (message.sendStatus === "sending") {
      text = "Đang gửi...";
    } else if (message.sendStatus === "seen") {
      text = "Đã xem";
    }

    return <Text style={MessageItemStyle.statusText}>{text}</Text>;
  };

  return (
    <View
      style={[
        MessageItemStyle.container,
        isSender
          ? MessageItemStyle.senderContainer
          : MessageItemStyle.receiverContainer,
        isHighlighted && MessageItemStyle.highlighted,
      ]}
    >
      {!isSender && (
        <View style={MessageItemStyle.avatarContainer}>{renderAvatar()}</View>
      )}
      <View>
        <View
          style={[
            MessageItemStyle.messageBox,
            isSender ? MessageItemStyle.sender : MessageItemStyle.receiver,
          ]}
        >
          {renderSenderName()}
          {renderContent()}
          <Text style={MessageItemStyle.timestamp}>{formattedTime}</Text>
        </View>
        <View style={MessageItemStyle.newText}>{renderStatus()}</View>
      </View>
    </View>
  );
};

export default MessageItem;
