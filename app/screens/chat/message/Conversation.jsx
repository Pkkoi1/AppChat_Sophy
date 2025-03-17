import React, { useRef, useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import MessageItem from "./MessageItem";
import moment from "moment";
import ConversationStyle from "./ConversationStyle";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // For icons
import * as Clipboard from "@react-native-community/clipboard"; // Sử dụng Clipboard

// Lấy kích thước màn hình
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Popup menu options với màu sắc icon như trong hình
const popupOptions = [
  {
    label: "Trả lời",
    icon: "reply-outline",
    action: "reply",
    iconColor: "#A855F7",
  }, // Màu tím
  {
    label: "Chuyển tiếp",
    icon: "share-outline",
    action: "forward",
    iconColor: "#3B82F6",
  }, // Màu xanh dương
  {
    label: "Lưu Cloud",
    icon: "cloud-upload-outline",
    action: "saveToCloud",
    iconColor: "#3B82F6",
  }, // Màu xanh dương
  { label: "Thu hồi", icon: "undo", action: "recall", iconColor: "#F97316" }, // Màu cam
  {
    label: "Sao chép",
    icon: "content-copy",
    action: "copy",
    iconColor: "#3B82F6",
  }, // Màu xanh dương
  { label: "Ghim", icon: "pin-outline", action: "pin", iconColor: "#F97316" }, // Màu cam
  {
    label: "Nhắc hẹn",
    icon: "clock-outline",
    action: "reminder",
    iconColor: "#EF4444",
  }, // Màu đỏ
  {
    label: "Chọn nhiều",
    icon: "checkbox-multiple-marked-outline",
    action: "selectMultiple",
    iconColor: "#3B82F6",
  }, // Màu xanh dương
  {
    label: "Tạo tin nhắn nhanh",
    icon: "lightning-bolt",
    action: "createQuickMessage",
    iconColor: "#3B82F6",
  }, // Màu xanh dương
  {
    label: "Dịch",
    icon: "translate",
    action: "translate",
    iconColor: "#22C55E",
  }, // Màu xanh lá
  {
    label: "Đọc văn bản",
    icon: "volume-high",
    action: "readText",
    iconColor: "#22C55E",
  }, // Màu xanh lá
  {
    label: "Chi tiết",
    icon: "information-outline",
    action: "details",
    iconColor: "#6B7280",
  }, // Màu xám
  {
    label: "Xóa",
    icon: "delete-outline",
    action: "delete",
    iconColor: "#EF4444",
    color: "red",
  }, // Màu đỏ
];

const Conversation = ({ conversation, senderId, searchQuery }) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageReactions, setMessageReactions] = useState({}); // Trạng thái lưu phản ứng cho từng tin nhắn

  // Xử lý khi nhấn lâu vào tin nhắn
  const handleLongPress = (message) => {
    setSelectedMessage(message);
    setPopupVisible(true);
  };

  // Xử lý khi nhấn vào emoji để thả vào tin nhắn
  const handleEmojiPress = (emoji) => {
    if (selectedMessage) {
      const messageId = selectedMessage.message_id;
      setMessageReactions((prevReactions) => {
        const currentReactions = prevReactions[messageId] || [];
        return {
          ...prevReactions,
          [messageId]: [...currentReactions, emoji], // Thêm emoji vào danh sách phản ứng
        };
      });
      setPopupVisible(false); // Đóng popup sau khi thả emoji
    }
  };

  // Xử lý khi nhấn vào tùy chọn trong popup
  const handlePopupOptionPress = (action) => {
    switch (action) {
      case "reply":
        console.log("Trả lời tin nhắn:", selectedMessage.message_id);
        // Thêm logic để mở giao diện trả lời
        break;
      case "forward":
        console.log("Chuyển tiếp tin nhắn:", selectedMessage.message_id);
        // Thêm logic để chuyển tiếp tin nhắn
        break;
      case "saveToCloud":
        console.log("Lưu vào Cloud:", selectedMessage.message_id);
        // Thêm logic để lưu tin nhắn vào cloud
        break;
      case "recall":
        if (selectedMessage.sender_id === senderId) {
          console.log("Thu hồi tin nhắn:", selectedMessage.message_id);
          // Thêm logic để thu hồi tin nhắn
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
        // Thêm logic để ghim tin nhắn
        break;
      case "reminder":
        console.log("Đặt nhắc hẹn cho tin nhắn:", selectedMessage.message_id);
        // Thêm logic để đặt nhắc hẹn
        break;
      case "selectMultiple":
        console.log(
          "Chọn nhiều tin nhắn bắt đầu từ:",
          selectedMessage.message_id
        );
        // Thêm logic để bật chế độ chọn nhiều
        break;
      case "createQuickMessage":
        console.log("Tạo tin nhắn nhanh từ:", selectedMessage.message_id);
        // Thêm logic để tạo tin nhắn nhanh
        break;
      case "translate":
        console.log("Dịch tin nhắn:", selectedMessage.message_id);
        // Thêm logic để dịch tin nhắn
        break;
      case "readText":
        console.log("Đọc to tin nhắn:", selectedMessage.message_id);
        // Thêm logic để đọc to (text-to-speech)
        break;
      case "details":
        console.log("Xem chi tiết tin nhắn:", selectedMessage.message_id);
        // Thêm logic để hiển thị chi tiết tin nhắn
        break;
      case "delete":
        console.log("Xóa tin nhắn:", selectedMessage.message_id);
        // Thêm logic để xóa tin nhắn
        break;
      default:
        console.log("Hành động không xác định:", action);
        break;
    }
    setPopupVisible(false);
  };

  return (
    <View style={ConversationStyle.conversationContainer}>
      <FlatList
        data={[...conversation.messages].reverse()}
        keyExtractor={(item) => item.message_id}
        renderItem={({ item, index }) => {
          const prevMessage =
            index > 0 ? conversation.messages[index - 1] : null;
          const isNewSender =
            !prevMessage || prevMessage.sender_id !== item.sender_id;
          const isTimeGap =
            !prevMessage ||
            moment(item.timestamp).diff(
              moment(prevMessage.timestamp),
              "minutes"
            ) >= 20;

          const showAvatar = isNewSender || isTimeGap;
          const formattedTimestamp =
            moment().diff(moment(item.timestamp), "days") >= 1
              ? moment(item.timestamp).format("HH:mm DD/MM/YYYY")
              : `${moment(item.timestamp).format("HH:mm")} Hôm nay`;

          const avatar = conversation.participants.find(
            (p) => p.id === item.sender_id
          )?.avatar;

          const reactions = messageReactions[item.message_id] || []; // Lấy danh sách phản ứng của tin nhắn

          return (
            <View>
              {isTimeGap && (
                <View style={ConversationStyle.timestampContainer}>
                  <Text style={ConversationStyle.timestampText}>
                    {formattedTimestamp}
                  </Text>
                </View>
              )}
              <Pressable onLongPress={() => handleLongPress(item)}>
                <View>
                  <MessageItem
                    message={item}
                    isSender={item.sender_id === senderId}
                    avatar={avatar}
                    reactions={reactions} // Truyền danh sách phản ứng vào MessageItem
                    searchQuery={searchQuery} // Truyền searchQuery vào MessageItem
                  />
                </View>
              </Pressable>
            </View>
          );
        }}
        inverted={true}
      />

      {/* Popup Menu */}
      <Modal
        visible={popupVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setPopupVisible(false);
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setPopupVisible(false);
          }}
        >
          <View style={styles.popupContainer}>
            {/* Phần 1: Tin nhắn đã nhấn giữ */}
            <View style={styles.messageSection}>
              {selectedMessage && (
                <View style={styles.selectedMessageContainer}>
                  <Text style={styles.selectedMessageText}>
                    {selectedMessage.content}
                  </Text>
                </View>
              )}
            </View>

            {/* Phần 2: Các icon (emoji) */}
            <View style={styles.emojiSection}>
              <View style={styles.emojiContainer}>
                {["❤️", "👍", "😂", "😮", "😢", "😡"].map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.emojiButton}
                    onPress={() => handleEmojiPress(emoji)} // Xử lý khi bấm vào emoji
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Phần 3: Các chức năng */}
            <View style={styles.optionsSection}>
              <FlatList
                data={popupOptions}
                keyExtractor={(item) => item.action}
                numColumns={4} // Tạo bố cục lưới 4 cột
                columnWrapperStyle={styles.columnWrapper} // Thêm style cho các cột
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => handlePopupOptionPress(item.action)}
                  >
                    <Icon
                      name={item.icon}
                      size={32} // Giữ size 24 để đường nét mỏng
                      color={item.iconColor || "#333"} // Sử dụng màu icon từ popupOptions
                      style={styles.gridIcon}
                    />
                    <Text
                      style={[
                        styles.gridText,
                        item.color && { color: item.color },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
                style={styles.gridContainer}
                contentContainerStyle={styles.gridContent} // Đảm bảo các item bắt đầu từ trái
              />
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

// Styles cho popup
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Làm mờ nền
    justifyContent: "center", // Căn giữa theo chiều dọc
    alignItems: "center", // Căn giữa theo chiều ngang
  },
  popupContainer: {
    width: SCREEN_WIDTH * 0.8, // Chiều rộng chiếm 80% màn hình
    maxHeight: SCREEN_HEIGHT * 0.7, // Chiều cao tối đa 70% màn hình
  },
  messageSection: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10, // Khoảng cách giữa các phần
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignSelf: "center", // Căn giữa phần tin nhắn
  },
  selectedMessageContainer: {
    padding: 10,
    flexShrink: 1, // Đảm bảo nội dung không bị cắt
  },
  selectedMessageText: {
    fontSize: 14,
    color: "#333",
    flexWrap: "wrap", // Cho phép nội dung tự động xuống dòng
  },
  emojiSection: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10, // Khoảng cách giữa các phần
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emojiContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  emojiButton: {
    padding: 5,
  },
  emojiText: {
    fontSize: 22, // Giữ nguyên 22, phù hợp với icon mỏng
  },
  optionsSection: {
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: "center", // Căn giữa container của lưới
    justifyContent: "center", // Căn giữa container của lưới
  },
  gridContainer: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    width: "100%", // Đảm bảo lưới chiếm toàn bộ chiều rộng của container
  },
  gridContent: {
    flexGrow: 1,
    justifyContent: "flex-start", // Các item trong lưới bắt đầu từ trái
  },
  columnWrapper: {
    justifyContent: "flex-start", // Đảm bảo mỗi hàng bắt đầu từ cột 1
    alignItems: "flex-start", // Đảm bảo các item trong hàng thẳng hàng từ trái
  },
  gridItem: {
    flex: 0, // Loại bỏ flex để kích thước cố định
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    paddingBottom: 10,
    margin: 3.5,
    backgroundColor: "white",
    minWidth: (SCREEN_WIDTH * 0.8 - 20) / 4 - 4, // Tính toán kích thước cố định cho mỗi cột
    maxWidth: (SCREEN_WIDTH * 0.8 - 20) / 4 - 4, // Đảm bảo kích thước cố định
  },
  gridIcon: {
    marginBottom: 5,
  },
  gridText: {
    fontSize: 12, // Giữ nguyên 10, phù hợp với icon mỏng
    color: "#333",
    textAlign: "center",
    width: "100%", // Đảm bảo văn bản bắt đầu từ trái
  },
});

export default Conversation;
