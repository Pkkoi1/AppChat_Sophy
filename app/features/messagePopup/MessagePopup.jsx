import React from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Clipboard from "@react-native-clipboard/clipboard";
import { api } from "@/app/api/api"; // Import the API module
import { useNavigation } from "@react-navigation/native";
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
  setMessages, // Add setMessages as a prop to update the message list
  messages, // Add messages as a prop to access the current message list
}) => {
  const navigation = useNavigation(); // Initialize navigation

  const handleEmojiPress = (emoji) => {
    if (selectedMessage) {
      const messageId = selectedMessage.messageDetailId;
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

  const handlePopupOptionPress = async (action) => {
    switch (action) {
      case "reply":
        console.log("Trả lời tin nhắn:", selectedMessage.messageDetailId);
        break;
      case "forward":
        if (selectedMessage) {
          console.log("Chuyển tiếp tin nhắn:", selectedMessage.messageDetailId);
          navigation.navigate("ShareMessage", {
            message: selectedMessage,
          });
        }
        break;
      case "saveToCloud":
        console.log("Lưu vào Cloud:", selectedMessage.messageDetailId);
        break;
      case "recall":
        if (selectedMessage.senderId === senderId) {
          try {
            console.log("Thu hồi tin nhắn:", selectedMessage.messageDetailId);
            const response = await api.recallMessage(
              selectedMessage.messageDetailId
            );
            console.log("Tin nhắn đã được thu hồi:", response);

            // Update the UI to mark the message as recalled
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.messageDetailId === selectedMessage.messageDetailId
                  ? { ...msg, isRecall: true }
                  : msg
              )
            );
          } catch (error) {
            console.error(
              "Lỗi khi thu hồi tin nhắn:",
              error.response?.data || error.message
            );
            Alert.alert("Lỗi", "Không thể thu hồi tin nhắn. Vui lòng thử lại.");
          }
        } else {
          console.log("Không thể thu hồi: Không phải người gửi");
          Alert.alert("Thông báo", "Bạn không thể thu hồi tin nhắn này.");
        }
        break;
      case "copy":
        Clipboard.setStringAsync(selectedMessage.content);
        console.log("Đã sao chép tin nhắn:", selectedMessage.messageDetailId);
        break;
      case "pin":
        if (selectedMessage) {
          try {
            if (selectedMessage.isPinned) {
              console.log("Bỏ ghim tin nhắn:", selectedMessage.messageDetailId);
              await api.unPinMessage(selectedMessage.messageDetailId);
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.messageDetailId === selectedMessage.messageDetailId
                    ? { ...msg, isPinned: false, pinnedAt: null }
                    : msg
                )
              );
              Alert.alert("Thành công", "Tin nhắn đã được bỏ ghim.");
            } else {
              console.log("Ghim tin nhắn:", selectedMessage.messageDetailId);
              if (!messages) {
                throw new Error("Messages list is undefined.");
              }
              const pinnedMessages = messages.filter((msg) => msg.isPinned);
              if (pinnedMessages.length >= 3) {
                // Unpin the oldest pinned message
                const oldestPinnedId = pinnedMessages[0].messageDetailId;
                await api.unPinMessage(oldestPinnedId);
                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.messageDetailId === oldestPinnedId
                      ? { ...msg, isPinned: false, pinnedAt: null }
                      : msg
                  )
                );
              }
              await api.pinMessage(selectedMessage.messageDetailId);
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.messageDetailId === selectedMessage.messageDetailId
                    ? {
                        ...msg,
                        isPinned: true,
                        pinnedAt: new Date().toISOString(),
                      }
                    : msg
                )
              );
              Alert.alert("Thành công", "Tin nhắn đã được ghim.");
            }
          } catch (error) {
            console.error(
              "Lỗi khi xử lý ghim/bỏ ghim tin nhắn:",
              error.response?.data || error.message
            );
            Alert.alert(
              "Lỗi",
              "Không thể xử lý ghim/bỏ ghim tin nhắn. Vui lòng thử lại."
            );
          }
        }
        break;
      case "reminder":
        console.log(
          "Đặt nhắc hẹn cho tin nhắn:",
          selectedMessage.messageDetailId
        );
        break;
      case "selectMultiple":
        console.log(
          "Chọn nhiều tin nhắn bắt đầu từ:",
          selectedMessage.messageDetailId
        );
        break;
      case "createQuickMessage":
        console.log("Tạo tin nhắn nhanh từ:", selectedMessage.messageDetailId);
        break;
      case "translate":
        console.log("Dịch tin nhắn:", selectedMessage.messageDetailId);
        break;
      case "readText":
        console.log("Đọc to tin nhắn:", selectedMessage.messageDetailId);
        break;
      case "details":
        console.log("Xem chi tiết tin nhắn:", selectedMessage.messageDetailId);
        break;
      case "delete":
        try {
          console.log("Xóa tin nhắn:", selectedMessage.messageDetailId);
          const response = await api.deleteMessage(
            selectedMessage.messageDetailId
          );
          console.log("Tin nhắn đã được xóa:", response);

          // Update the UI to remove the deleted message
          setMessages((prevMessages) =>
            prevMessages.filter(
              (msg) => msg.messageDetailId !== selectedMessage.messageDetailId
            )
          );
          Alert.alert("Thành công", "Tin nhắn đã được xóa.");
        } catch (error) {
          console.error(
            "Lỗi khi xóa tin nhắn:",
            error.response?.data || error.message
          );
          Alert.alert("Lỗi", "Không thể xóa tin nhắn. Vui lòng thử lại.");
        }
        break;
      default:
        console.log("Hành động không xác định:", action);
        break;
    }
    setPopupVisible(false);
  };

  // Filter options based on whether the message is recalled
  const filteredOptions = selectedMessage?.isRecall
    ? popupOptions.filter((option) => option.action === "delete")
    : popupOptions.map((option) => {
        if (option.action === "pin" || option.action === "unpin") {
          return {
            ...option,
            label: selectedMessage?.isPinned ? "Bỏ ghim" : "Ghim",
            icon: selectedMessage?.isPinned ? "pin-off-outline" : "pin-outline",
            action: "pin", // Keep the action as "pin" for both cases
          };
        }
        return option;
      });

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
                  {selectedMessage.isRecall
                    ? "Tin nhắn đã được thu hồi"
                    : selectedMessage.content}
                </Text>
              </View>
            )}
          </View>

          <View style={MessagePopupStyle.emojiSection}>
            {!selectedMessage?.isRecall && (
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
            )}
          </View>

          <View style={MessagePopupStyle.optionsSection}>
            <FlatList
              data={filteredOptions}
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
                  ></Text>
                  <Text style={MessagePopupStyle.gridText}>{item.label}</Text>
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
