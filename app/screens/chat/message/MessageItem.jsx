import React, { useContext, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { Video } from "expo-av";
import MessageItemStyle from "./MessageItemStyle";
import HighlightText from "../../../components/highlightText/HighlightText";
import AvatarUser from "@/app/components/profile/AvatarUser";
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
import * as Sharing from "expo-sharing";
import { AuthContext } from "@/app/auth/AuthContext";
import { Linking } from "react-native";

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
  onScrollToMessage,
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

  const renderNotification = () => {
    const { notification } = message;
    if (!notification) return null;
    return (
      <View style={MessageItemStyle.notificationContainer}>
        <Text style={MessageItemStyle.notificationText}>{message.content}</Text>
      </View>
    );
  };

  const handleDownload = async (fileUrl, fileName, downloadUrl) => {
    try {
      const path = FileSystem.cacheDirectory + fileName;
      const res = FileSystem.createDownloadResumable(
        downloadUrl || fileUrl,
        path
      );
      const { uri } = await res.downloadAsync();

      if (!uri) throw new Error("Không thể tải file");

      const extension = fileName.split(".").pop()?.toLowerCase();

      if (["jpg", "jpeg", "png", "mp4", "mp3"].includes(extension)) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          return Alert.alert("Từ chối truy cập", "Không thể lưu file media.");
        }

        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync("Download", asset, false);

        Alert.alert("Thành công", "File media đã lưu vào thư viện.");
      } else {
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
        style={{ marginLeft: 5 }}
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

  const renderReplyContent = () => {
    const { replyData, messageReplyId } = message;

    if (!replyData) return null;

    const replyType = replyData.type;
    const replyContent = replyData.content || "Tin nhắn không hỗ trợ";
    const replySender =
      replyData.senderId === userInfo.userId
        ? userInfo?.fullname
        : receiver?.fullname;

    if (replyData.isRecall || messageReplyId?.isRecall) {
      return (
        <TouchableOpacity onPress={() => onScrollToMessage(messageReplyId)}>
          <View style={MessageItemStyle.replyContainer}>
            <Text style={MessageItemStyle.replySender}>{replySender}:</Text>
            <Text style={MessageItemStyle.replyContent}>
              Tin nhắn đã được thu hồi
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity onPress={() => onScrollToMessage(messageReplyId)}>
        <View style={MessageItemStyle.replyContainer}>
          <Text style={MessageItemStyle.replySender}>{replySender}:</Text>
          {replyType === "text" ? (
            <Text style={MessageItemStyle.replyContent}>{replyContent}</Text>
          ) : replyType === "image" || "text-with-image" ? (
            <Text style={MessageItemStyle.replyContent}>[Hình ảnh]</Text>
          ) : replyType === "file" ? (
            <Text style={MessageItemStyle.replyContent}>[Tệp tin]</Text>
          ) : replyType === "video" ? (
            <Text style={MessageItemStyle.replyContent}>[Video]</Text>
          ) : (
            <Text style={MessageItemStyle.replyContent}>[Không hỗ trợ]</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const isLink = (text) => {
    const urlRegex =
      /\b(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.(com|net|org|io|gov|edu|vn|co))\b/gi;
    return urlRegex.test(text);
  };

  const handleLinkPress = async (url) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Không thể mở link", url);
    }
  };

  const renderTextWithLinks = (text) => {
    const urlRegex =
      /\b(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.(com|net|org|io|gov|edu|vn|co))\b/gi;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (isLink(part)) {
        return (
          <TouchableOpacity key={index} onPress={() => handleLinkPress(part)}>
            <Text style={[MessageItemStyle.content, { color: "#3f88f2" }]}>
              {part}
            </Text>
          </TouchableOpacity>
        );
      }
      return (
        <Text key={index} style={MessageItemStyle.content}>
          {part}
        </Text>
      );
    });
  };

  const renderContent = () => {
    const { type, attachment, isRecall, isReply } = message;
    const content = message.content || "";

    if (type === "notification") {
      return renderNotification();
    }

    if (isRecall) {
      return (
        <Text style={MessageItemStyle.recalledMessage}>
          Tin nhắn đã được thu hồi
        </Text>
      );
    }

    return (
      <>
        {isReply && renderReplyContent()}
        {type === "text" ? (
          <View style={MessageItemStyle.textContainer}>
            {searchQuery ? (
              <HighlightText
                text={content}
                searchQuery={searchQuery}
                style={MessageItemStyle.content}
                highlightStyle={{ backgroundColor: "#FFFF00" }}
              />
            ) : (
              renderTextWithLinks(content)
            )}
          </View>
        ) : type === "file" && attachment ? (
          <View style={MessageItemStyle.fileContainer}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              {renderFileIcon(attachment.type || "unknown")}
              <Text style={MessageItemStyle.fileName}>
                {attachment.name || "Tệp tin"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                handleDownload(
                  attachment.url,
                  attachment.name || "Tệp tin",
                  attachment.downloadUrl
                )
              }
              style={MessageItemStyle.downloadButton}
            >
              <Text style={MessageItemStyle.downloadButtonText}>Tải xuống</Text>
            </TouchableOpacity>
          </View>
        ) : (type === "image" || type === "text-with-image") && attachment ? (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("FullScreenImageViewer", {
                imageUrl: attachment.url || errorImage,
              })
            }
          >
            <Image
              source={{ uri: attachment.url || errorImage }}
              style={MessageItemStyle.image}
            />
          </TouchableOpacity>
        ) : type === "video" && attachment ? (
          <View>
            <Video
              source={{ uri: attachment.url }}
              style={MessageItemStyle.video}
              resizeMode="contain"
              useNativeControls
            />
          </View>
        ) : (
          <Text style={MessageItemStyle.unsupported}>
            Không hỗ trợ loại tin nhắn này
          </Text>
        )}
      </>
    );
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

  if (message.type === "notification") {
    return (
      <View style={MessageItemStyle.notificationContainer}>
        {renderNotification()}
      </View>
    );
  }

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
