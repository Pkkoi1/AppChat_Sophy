import { api } from "@/app/api/api";
import { AuthContext } from "@/app/auth/AuthContext";
import React, { memo, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";

const getFileIcon = (fileName = "", mimeType = "") => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (mimeType.includes("pdf") || ext === "pdf")
    return <FontAwesome5 name="file-pdf" size={32} color="#d9534f" />;
  if (mimeType.includes("word") || ["doc", "docx"].includes(ext))
    return <FontAwesome5 name="file-word" size={32} color="#007bff" />;
  if (mimeType.includes("excel") || ["xls", "xlsx"].includes(ext))
    return <FontAwesome5 name="file-excel" size={32} color="#28a745" />;
  if (mimeType.includes("zip") || ["zip", "rar", "7z"].includes(ext))
    return <FontAwesome5 name="file-archive" size={32} color="#f0ad4e" />;
  if (["mp3", "wav", "ogg", "m4a", "aac", "flac", "opus"].includes(ext))
    return <Feather name="mic" size={32} color="#A855F7" />;
  if (
    ["mp4", "mov", "avi", "mkv", "webm"].includes(ext) ||
    mimeType.startsWith("video")
  )
    return <Feather name="video" size={32} color="#009688" />;
  return <MaterialIcons name="insert-drive-file" size={32} color="#6c757d" />;
};

const PinnedMessage = ({
  receiver,
  pinnedMessages,
  onClose,
  onScrollToMessage,
  setMessages,
}) => {
  const { userInfo } = useContext(AuthContext);

  // Function to unpin recalled messages
  const handleUnPinRecalledMessages = async () => {
    for (const item of pinnedMessages) {
      if (item.isRecall) {
        await api.unPinMessage(item.messageDetailId); // Call the unPinMessage API
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.messageDetailId === item.messageDetailId
              ? { ...msg, isPinned: false, pinnedAt: null }
              : msg
          )
        );
      }
    }
  };

  useEffect(() => {
    handleUnPinRecalledMessages(); // Unpin recalled messages on component mount
  }, [pinnedMessages]);

  // Filter out recalled messages
  const filteredPinnedMessages = pinnedMessages.filter(
    (item) => !item.isRecall
  );

  const renderItem = ({ item }) => {
    const type = item.type || (item.attachment && item.attachment.type);
    const attachment = item.attachment;
    let leftContent = null;
    const ICON_SIZE = 44;
    if (type === "image" || type === "text-with-image") {
      leftContent = (
        <Image
          source={{ uri: (attachment && attachment.url) || attachment || "" }}
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            borderRadius: 6,
            marginRight: 10,
            backgroundColor: "#eee",
          }}
        />
      );
    } else if (type === "audio") {
      leftContent = (
        <View
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            borderRadius: 6,
            marginRight: 10,
            backgroundColor: "#eee",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="mic" size={32} color="#A855F7" />
        </View>
      );
    } else if (type === "file") {
      leftContent = (
        <View
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            borderRadius: 6,
            marginRight: 10,
            backgroundColor: "#eee",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {getFileIcon(attachment?.name, attachment?.mimeType)}
        </View>
      );
    } else if (type === "video") {
      leftContent = (
        <View
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            borderRadius: 6,
            marginRight: 10,
            backgroundColor: "#eee",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="video" size={32} color="#009688" />
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.pinnedMessageContainer}
        onPress={() => {
          onScrollToMessage(item.messageDetailId);
          onClose();
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {leftContent}
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={styles.pinnedSenderText} numberOfLines={1}>
              {item.senderId === userInfo.userId
                ? userInfo.fullname
                : receiver?.fullname || "Người dùng"}
            </Text>

            <Text style={styles.pinnedMessageText} numberOfLines={2}>
              {(() => {
                if (type === "text" || type === "text-with-image") {
                  return item.content;
                }
                if (type === "image") {
                  return "[Hình ảnh]";
                }
                if (type === "audio") {
                  return attachment?.name || "[Ghi âm]";
                }
                if (type === "file") {
                  return attachment?.name || "[Tệp tin]";
                }
                if (type === "video") {
                  return "[Video]";
                }
                return item.content || "";
              })()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getItemLayout = (data, index) => ({
    length: 50, // Fixed height of each item (change if needed)
    offset: 50 * index,
    index,
  });

  const handleScrollToIndexFailed = (info) => {
    console.warn("Scroll failed: ", info);
    // Handle fallback, e.g., scroll to the nearest position
  };

  return (
    <View style={styles.pinnedContainer}>
      <Text style={styles.pinnedTitle}>
        Tin nhắn đã ghim ({filteredPinnedMessages.length})
      </Text>
      <FlatList
        data={filteredPinnedMessages}
        renderItem={renderItem}
        keyExtractor={(item) => item.messageDetailId}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={handleScrollToIndexFailed}
      />
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Đóng</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  pinnedContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 50,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  pinnedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pinnedMessageContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    minHeight: 64,
    justifyContent: "center",
  },
  pinnedSenderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlignVertical: "center",
    marginBottom: 0,
  },

  pinnedMessageText: {
    fontSize: 15,
    color: "#222",
    flexWrap: "wrap",
    textAlignVertical: "center",
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f8d7da",
    alignItems: "center",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#721c24",
    fontWeight: "bold",
  },
});

export default PinnedMessage;
