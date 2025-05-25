import React, { useContext, useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  TextInput,
} from "react-native";
import OptionHeader from "@/app/features/optionHeader/OptionHeader";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "@/app/auth/AuthContext";
import { api } from "@/app/api/api"; // Import the API module
import { useNavigation } from "@react-navigation/native";
import { SocketContext } from "@/app/socket/SocketContext"; // Import SocketContext
import Color from "@/app/components/colors/Color";

import AvatarUser from "@/app/components/profile/AvatarUser";
import RenderGroupAvatar from "@/app/components/group/RenderGroupAvatar";
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
import { Video } from "expo-av";

const ShareMessage = ({ route }) => {
  const { conversations, userInfo, handlerRefresh } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [selectedConversations, setSelectedConversations] = useState([]);
  const { message } = route.params;
  const [userDetails, setUserDetails] = useState({});
  const [search, setSearch] = useState(""); // Thêm state cho ô tìm kiếm
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserDetails = async (userId) => {
      if (!userDetails[userId]) {
        try {
          const response = await fetchUserInfo(userId);
          setUserDetails((prev) => ({
            ...prev,
            [userId]: response,
          }));
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      }
    };

    // Chỉ còn conversations, không còn pinnedConversations
    conversations.forEach((conversation) => {
      if (!conversation.isGroup) {
        const userId =
          conversation.receiverId === userInfo.userId
            ? conversation.creatorId
            : conversation.receiverId;
        fetchUserDetails(userId);
      }
    });
  }, [conversations, userInfo.userId, userDetails]);

  const getConversationDetails = (conversation) => {
    if (conversation.isGroup) {
      return {
        name: conversation.groupName,
        avatar: conversation.groupAvatarUrl,
        isGroup: true,
        groupMembers: conversation.groupMembers,
      };
    } else {
      const userId =
        conversation.receiverId === userInfo.userId
          ? conversation.creatorId
          : conversation.receiverId;
      const user = userDetails[userId];
      return {
        name: user?.fullname || "Unknown User",
        avatar: user?.urlavatar || null,
        isGroup: false,
        receiver: user,
      };
    }
  };

  const renderMessageContent = (message) => {
    const { type, content, attachment } = message;

    switch (type) {
      case "text":
        return <Text style={styles.messageContent}>{content}</Text>;
      case "image":
        return (
          <Image
            source={{
              uri: attachment?.url || "https://example.com/default-image.png",
            }}
            style={styles.messageImage}
          />
        );
      case "file":
        return (
          <View style={styles.fileContainer}>
            <Icon name="file-outline" size={24} color={Color.sophy} />
            <Text style={styles.fileName}>{attachment?.name || "Tệp tin"}</Text>
          </View>
        );
      case "video":
        return (
          <View>
            <Video
              source={{ uri: attachment?.url }}
              style={styles.video}
              resizeMode="contain"
              useNativeControls
            />
          </View>
        );
      case "audio":
        return (
          <View style={styles.fileContainer}>
            <Icon name="microphone-outline" size={24} color={Color.sophy} />
            <Text style={styles.fileName}>{attachment?.name || "Ghi âm"}</Text>
          </View>
        );
      case "text-with-image":
        return (
          <View>
            <Text style={styles.messageContent}>{content}</Text>
            <Image
              source={{
                uri: attachment?.url || "https://example.com/default-image.png",
              }}
              style={styles.messageImage}
            />
          </View>
        );
      default:
        return (
          <Text style={styles.unsupportedMessage}>
            Không hỗ trợ loại tin nhắn này
          </Text>
        );
    }
  };

  const toggleConversationSelection = (conversation) => {
    setSelectedConversations((prev) => {
      if (prev.some((c) => c.conversationId === conversation.conversationId)) {
        return prev.filter(
          (c) => c.conversationId !== conversation.conversationId
        );
      } else {
        return [...prev, conversation];
      }
    });
  };

  const handleShare = async () => {
    if (selectedConversations.length === 0) {
      Alert.alert(
        "Thông báo",
        "Vui lòng chọn ít nhất một cuộc trò chuyện để chia sẻ."
      );
      return;
    }

    try {
      for (const conversation of selectedConversations) {
        let response;

        switch (message.type) {
          case "text":
            response = await api.sendMessage({
              conversationId: conversation.conversationId,
              content: message.content,
            });
            break;

          case "image":
            response = await api.forwardImageMessage(
              message.messageDetailId,
              conversation.conversationId
            );
            break;

          case "video":
          case "file":
            response = await api.sendFileVideoMessage({
              conversationId: conversation.conversationId,
              attachment: message.attachment,
            });
            break;
          case "audio":
            response = await api.sendFileVideoMessage({
              conversationId: conversation.conversationId,
              attachment: message.attachment,
            });
            break;
          case "text-with-image":
            response = await api.forwardImageMessage(
              message.messageDetailId,
              conversation.conversationId
            );
            break;
          default:
            Alert.alert("Lỗi", "Loại tin nhắn không được hỗ trợ.");
            return;
        }

        // Emit the new message via socket
        if (socket && socket.connected) {
          socket.emit("newMessage", {
            conversationId: conversation.conversationId,
            message: {
              ...response,
              senderId: userInfo.userId,
            },
          });
          console.log("Gửi tin nhắn qua socket:", response);
        }
      }

      Alert.alert(
        "Thành công",
        "Tin nhắn đã được chia sẻ đến các cuộc trò chuyện đã chọn."
      );

      // Refresh the conversation list
      if (handlerRefresh) {
        await handlerRefresh();
      }

      // Navigate back to the previous screen
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Lỗi",
        `Không thể chia sẻ tin nhắn: ${error.message || "Lỗi không xác định"}`
      );
    }
  };

  // Chỉ còn conversations, không còn pinnedConversations
  const allConversations = conversations;

  // Lọc conversations theo tên nhóm hoặc tên người nhận
  const filteredConversations = conversations.filter((conversation) => {
    const { name } = getConversationDetails(conversation);
    return (
      !search ||
      name?.toLowerCase().includes(search.trim().toLowerCase())
    );
  });

  return (
    <View style={styles.container}>
      <OptionHeader title={"Chia sẻ"} />
      {/* Thêm ô tìm kiếm */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <TextInput
          placeholder="Tìm kiếm theo tên nhóm hoặc tên người nhận"
          value={search}
          onChangeText={setSearch}
          style={{
            backgroundColor: "#f0f0f0",
            borderRadius: 8,
            padding: 10,
            fontSize: 15,
            marginTop: 8,
            marginBottom: 8,
          }}
        />
      </View>
      <View style={styles.messagePreview}>
        <Text style={styles.previewTitle}>Tin nhắn được chia sẻ:</Text>
        {renderMessageContent(message)}
      </View>
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.conversationId.toString()}
        renderItem={({ item }) => {
          const { name, avatar, isGroup, groupMembers, receiver } =
            getConversationDetails(item);
          const isSelected = selectedConversations.some(
            (c) => c.conversationId === item.conversationId
          );
          return (
            <TouchableOpacity
              style={[
                styles.conversationItem,
                isSelected && { backgroundColor: "#e6f7ff" },
              ]}
              onPress={() => toggleConversationSelection(item)}
            >
              <View style={styles.avatarContainer}>
                {isGroup ? (
                  avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                  ) : (
                    <RenderGroupAvatar members={groupMembers} />
                  )
                ) : receiver?.urlavatar ? (
                  <Image
                    source={{ uri: receiver?.urlavatar }}
                    style={styles.avatar}
                  />
                ) : (
                  <AvatarUser
                    fullName={receiver?.fullname || "User"}
                    width={50}
                    height={50}
                    avtText={20}
                    shadow={false}
                    bordered={false}
                  />
                )}
              </View>
              <View style={styles.conversationDetails}>
                <Text style={styles.conversationTitle}>{name}</Text>
                <Icon
                  name={
                    isSelected ? "checkbox-marked" : "checkbox-blank-outline"
                  }
                  size={24}
                  color={isSelected ? `${Color.sophy}` : "#ccc"}
                />
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={[
          styles.shareButton,
          selectedConversations.length === 0 && { backgroundColor: "#ccc" },
        ]}
        onPress={handleShare}
        disabled={selectedConversations.length === 0} // Disable button if no conversation is selected
      >
        <Text style={styles.shareButtonText}>Chia sẻ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  listContainer: {
    padding: 10,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  conversationDetails: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  shareButton: {
    backgroundColor: Color.sophy,
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  messagePreview: {
    padding: 15,
    margin: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  messageContent: {
    fontSize: 14,
    color: "#333",
  },
  messageImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  fileName: {
    marginLeft: 10,
    fontSize: 14,
    color: Color.sophy,
  },
  unsupportedMessage: {
    fontSize: 14,
    color: "#999",
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
});

export default ShareMessage;
