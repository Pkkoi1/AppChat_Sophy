import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import moment from "moment";
import { useNavigation } from "@react-navigation/native"; // Import navigation hook
import MessageItemStyle from "./MessageItemStyle";
import HighlightText from "../../../components/highlightText/HighlightText";
import AvatarUser from "@/app/components/profile/AvatarUser";
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
import FullScreenImageViewer from "@/app/features/fullImages/FullScreenImageViewer";

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
  const englishInitial = convertToEnglish(initial);
  const charCode = englishInitial.charCodeAt(0);
  if (charCode >= 65 && charCode <= 69) return "#2e5389"; // A-E
  if (charCode >= 70 && charCode <= 74) return "#2b7155"; // F-J
  if (charCode >= 75 && charCode <= 79) return "#009688"; // K-O
  if (charCode >= 80 && charCode <= 84) return "#3D2F00"; // P-T
  if (charCode >= 85 && charCode <= 90) return "#AD8500"; // U-Z
  return "#B0B0B0"; // Default color
};

const MessageItem = ({
  message,
  isSender,
  searchQuery,
  isHighlighted,
  receiver,
  isFirstMessageFromSender, // Thêm prop để xác định tin nhắn đầu tiên của người gửi
}) => {
  const formattedTimestamp = moment(message.createdAt).format("HH:mm");
  const [senders, setSenders] = useState([]);
  const navigation = useNavigation(); // Initialize navigation
  const isGroup = !receiver;

  const fetchSenders = async () => {
    try {
      const response = await fetchUserInfo(message.senderId);
      if (response) {
        setSenders((prevSenders) => [...prevSenders, response]);
      }
    } catch (error) {
      console.error("Error fetching sender details:", error);
    }
  };

  useEffect(() => {
    if (message.senderId) {
      fetchSenders();
    }
  }, [message.senderId]);

  const renderAvatar = () => {
    if (isGroup) {
      if (message.senderId) {
        const fetchedSender = senders.find(
          (sender) => sender.userId === message.senderId
        );
        return fetchedSender?.urlavatar ? (
          <Image
            source={{ uri: fetchedSender.urlavatar }}
            style={MessageItemStyle.avatar}
          />
        ) : (
          <AvatarUser
            fullName={fetchedSender?.fullname || "User"}
            width={32}
            height={32}
            avtText={12}
            shadow={false}
            bordered={false}
          />
        );
      }
      return (
        <AvatarUser
          fullName="User"
          width={32}
          height={32}
          avtText={12}
          shadow={false}
          bordered={false}
        />
      );
    } else {
      return receiver?.urlavatar ? (
        <Image
          source={{ uri: receiver.urlavatar }}
          style={MessageItemStyle.avatar}
        />
      ) : (
        <AvatarUser
          fullName={receiver?.fullname || "User"}
          width={32}
          height={32}
          avtText={12}
          shadow={false}
          bordered={false}
        />
      );
    }
  };

  const renderSenderName = () => {
    if (isGroup && !isSender) {
      const fetchedSender = senders.find(
        (sender) => sender.userId === message.senderId
      );
      const senderName = fetchedSender?.fullname || "User";
      const initial = senderName.charAt(0).toUpperCase();
      const color = getColorForInitial(initial);
      return (
        <Text style={[MessageItemStyle.senderName, { color }]}>
          {senderName}
        </Text>
      );
    }
    return null;
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case "text":
        return (
          <HighlightText
            text={message.content}
            highlight={searchQuery}
            style={MessageItemStyle.content}
          />
        );
      case "text-with-image":
        return (
          <View>
            <HighlightText
              text={message.content}
              highlight={searchQuery}
              style={MessageItemStyle.content}
            />
            {message.attachments && message.attachments.length > 0 && (
              <TouchableOpacity
                onPress={() =>
                  console.log("Image clicked:", message.attachments[0].url)
                }
              >
                <Image
                  source={{ uri: message.attachments[0].url }}
                  style={MessageItemStyle.image}
                />
              </TouchableOpacity>
            )}
          </View>
        );
      case "image":
        const imageUrl =
          message.content || message.attachment?.url || errorImage;
        return (
          <View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("FullScreenImageViewer", { imageUrl })
              }
            >
              <Image
                source={{ uri: imageUrl }}
                style={MessageItemStyle.image}
              />
            </TouchableOpacity>
            {message.sendStatus === "failed" && (
              <Text style={MessageItemStyle.errorText}>
                Không thể gửi tin nhắn
              </Text>
            )}
          </View>
        );
      case "file":
        return (
          <View style={MessageItemStyle.fileContainer}>
            <Text style={MessageItemStyle.fileName}>
              {message.attachments?.[0]?.name ||
                message.attachment?.name ||
                "File"}
            </Text>
          </View>
        );
      case "video":
        return (
          <View>
            <Text style={MessageItemStyle.videoLabel}>Video:</Text>
            {message.attachments && message.attachments.length > 0 && (
              <Video
                source={{ uri: message.attachments[0].url }}
                style={MessageItemStyle.video}
                resizeMode="contain"
                controls
              />
            )}
          </View>
        );
      default:
        return (
          <Text style={MessageItemStyle.content}>
            {message.content || "Unsupported message type"}
          </Text>
        );
    }
  };

  const renderMessageStatus = () => {
    if (isSender && isFirstMessageFromSender) {
      // Chỉ hiển thị trạng thái cho tin nhắn đầu tiên của người gửi
      let statusText = "";
      const isReceived =
        receiver &&
        message.readBy.some((user) => user.userId === receiver.userId);

      if (isReceived) {
        statusText = "Đã nhận";
      } else {
        switch (message.sendStatus) {
          case "sending":
            statusText = "Đang gửi...";
            break;
          case "sent":
            statusText = "Đã gửi";
            break;
          case "seen":
            statusText = "Đã xem";
            break;
          default:
            statusText = "";
        }
      }

      return <Text style={MessageItemStyle.statusText}>{statusText}</Text>;
    }
    return null;
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
          {renderMessageContent()}
          <Text style={MessageItemStyle.timestamp}>{formattedTimestamp}</Text>
        </View>
        <View style={MessageItemStyle.newText}>{renderMessageStatus()}</View>
      </View>
    </View>
  );
};

export default MessageItem;
