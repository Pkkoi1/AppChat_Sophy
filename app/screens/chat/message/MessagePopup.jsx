import React from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Clipboard from "@react-native-community/clipboard";
import MessagePopupStyle from "./MessagePopupStyle";

const popupOptions = [
  {
    label: "Trả lời",
    icon: "reply-outline",
    action: "reply",
    iconColor: "#A855F7",
  },
  {
    label: "Chuyển tiếp",
    icon: "share-outline",
    action: "forward",
    iconColor: "#3B82F6",
  },
  {
    label: "Lưu Cloud",
    icon: "cloud-upload-outline",
    action: "saveToCloud",
    iconColor: "#3B82F6",
  },
  { label: "Thu hồi", icon: "undo", action: "recall", iconColor: "#F97316" },
  {
    label: "Sao chép",
    icon: "content-copy",
    action: "copy",
    iconColor: "#3B82F6",
  },
  { label: "Ghim", icon: "pin-outline", action: "pin", iconColor: "#F97316" },
  {
    label: "Nhắc hẹn",
    icon: "clock-outline",
    action: "reminder",
    iconColor: "#EF4444",
  },
  {
    label: "Chọn nhiều",
    icon: "checkbox-multiple-marked-outline",
    action: "selectMultiple",
    iconColor: "#3B82F6",
  },
  {
    label: "Tạo tin nhắn nhanh",
    icon: "lightning-bolt",
    action: "createQuickMessage",
    iconColor: "#3B82F6",
  },
  {
    label: "Dịch",
    icon: "translate",
    action: "translate",
    iconColor: "#22C55E",
  },
  {
    label: "Đọc văn bản",
    icon: "volume-high",
    action: "readText",
    iconColor: "#22C55E",
  },
  {
    label: "Chi tiết",
    icon: "information-outline",
    action: "details",
    iconColor: "#6B7280",
  },
  {
    label: "Xóa",
    icon: "delete-outline",
    action: "delete",
    iconColor: "#EF4444",
    color: "red",
  },
];

const MessagePopup = ({
  popupVisible,
  setPopupVisible,
  selectedMessage,
  setSelectedMessage,
  messageReactions,
  setMessageReactions,
  senderId,
}) => {
  const handleEmojiPress = (emoji) => {
    if (selectedMessage) {
      const messageId = selectedMessage.message_id;
      setMessageReactions((prevReactions) => {
        const currentReactions = prevReactions[messageId] || [];
        return {
          ...prevReactions,
          [messageId]: [...currentReactions, emoji],
        };
      });
      setPopupVisible(false);
    }
  };

  const handlePopupOptionPress = (action) => {
    switch (action) {
      case "reply":
        console.log("Trả lời tin nhắn:", selectedMessage.message_id);
        break;
      case "forward":
        console.log("Chuyển tiếp tin nhắn:", selectedMessage.message_id);
        break;
      case "saveToCloud":
        console.log("Lưu vào Cloud:", selectedMessage.message_id);
        break;
      case "recall":
        if (selectedMessage.sender_id === senderId) {
          console.log("Thu hồi tin nhắn:", selectedMessage.message_id);
        } else {
          console.log("Không thể thu hồi: Không phải người gửi");
        }
        break;
      case "copy":
        Clipboard.setStringAsync(selectedMessage.content);
        console.log("Đã sao chép tin nhắn:", selectedMessage.message_id);
        break;
      case "pin":
        console.log("Ghim tin nhắn:", selectedMessage.message_id);
        break;
      case "reminder":
        console.log("Đặt nhắc hẹn cho tin nhắn:", selectedMessage.message_id);
        break;
      case "selectMultiple":
        console.log(
          "Chọn nhiều tin nhắn bắt đầu từ:",
          selectedMessage.message_id
        );
        break;
      case "createQuickMessage":
        console.log("Tạo tin nhắn nhanh từ:", selectedMessage.message_id);
        break;
      case "translate":
        console.log("Dịch tin nhắn:", selectedMessage.message_id);
        break;
      case "readText":
        console.log("Đọc to tin nhắn:", selectedMessage.message_id);
        break;
      case "details":
        console.log("Xem chi tiết tin nhắn:", selectedMessage.message_id);
        break;
      case "delete":
        console.log("Xóa tin nhắn:", selectedMessage.message_id);
        break;
      default:
        console.log("Hành động không xác định:", action);
        break;
    }
    setPopupVisible(false);
  };

  return (
    <Modal
      visible={popupVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        setPopupVisible(false);
      }}
    >
      <Pressable
        style={MessagePopupStyle.modalOverlay}
        onPress={() => {
          setPopupVisible(false);
        }}
      >
        <View style={MessagePopupStyle.popupContainer}>
          <View style={MessagePopupStyle.messageSection}>
            {selectedMessage && (
              <View style={MessagePopupStyle.selectedMessageContainer}>
                <Text style={MessagePopupStyle.selectedMessageText}>
                  {selectedMessage.content}
                </Text>
              </View>
            )}
          </View>

          <View style={MessagePopupStyle.emojiSection}>
            <View style={MessagePopupStyle.emojiContainer}>
              {["❤️", "👍", "😂", "😮", "😢", "😡"].map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={MessagePopupStyle.emojiButton}
                  onPress={() => handleEmojiPress(emoji)}
                >
                  <Text style={MessagePopupStyle.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={MessagePopupStyle.optionsSection}>
            <FlatList
              data={popupOptions}
              keyExtractor={(item) => item.action}
              numColumns={4}
              columnWrapperStyle={MessagePopupStyle.columnWrapper}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={MessagePopupStyle.gridItem}
                  onPress={() => handlePopupOptionPress(item.action)}
                >
                  <Icon
                    name={item.icon}
                    size={28}
                    color={item.iconColor || "#333"}
                    style={MessagePopupStyle.gridIcon}
                  />
                  <Text
                    style={[
                      MessagePopupStyle.gridText,
                      item.color && { color: item.color },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              style={MessagePopupStyle.gridContainer}
              contentContainerStyle={MessagePopupStyle.gridContent}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default MessagePopup;