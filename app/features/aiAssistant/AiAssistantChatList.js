import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from "react-native";
import { Clipboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import aiLogo from "../../../assets/images/AI.png";
import { api } from "../../api/api";
import Color from "../../components/colors/Color";

const AI_LOGO = aiLogo;
const AI_ASSISTANT_ID = "rai-assistant";

// Sample questions related to messaging
const SAMPLE_QUESTIONS = [
  "Gợi ý cách bắt đầu cuộc trò chuyện qua tin nhắn",
  "Làm sao để trả lời tin nhắn từ crush thật tự nhiên?",
  "Viết một tin nhắn chúc mừng sinh nhật ngắn gọn",
  "Cách nhắn tin xin lỗi bạn bè sao cho chân thành",
  "Gợi ý tin nhắn hẹn gặp mặt vui vẻ",
];

const AiAssistantChatList = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const conversations = await api.getAllAIConversations();
        console.log("Fetched conversations:", conversations);
        setConversationHistory(conversations);
        if (conversations && conversations.length > 0) {
          const latestConversation = conversations[0];
          setConversationId(latestConversation.conversationId);
          const formattedMessages = latestConversation.messages
            .map((msg, index) => ({
              _id: `${msg.role}_${index}_${msg.timestamp || Date.now()}`,
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp || new Date().toISOString(),
            }))
            .reverse();
          setMessages(formattedMessages);
        } else {
          setMessages([
            {
              _id: "1",
              role: "assistant",
              content: "Xin chào! Tôi là trợ lý Sophy. Bạn cần giúp gì?",
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching AI conversations:", error);
        setMessages([
          {
            _id: "1",
            role: "assistant",
            content: "Xin chào! Tôi là trợ lý Sophy. Bạn cần giúp gì?",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    };

    fetchConversations();
  }, []);

  const handleCopyMessage = (content) => {
    if (!content) {
      Alert.alert("Thông báo", "Tin nhắn trống, không thể sao chép.");
      return;
    }
    Clipboard.setString(content);
    Alert.alert("Thành công", "Đã sao chép tin nhắn!");
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const userMessage = {
      _id: `user_${Date.now()}`,
      role: "user",
      content: inputText,
      timestamp: new Date().toISOString(),
    };
    setMessages([userMessage, ...messages]);
    setInputText("");

    try {
      const response = await api.processAIRequest({
        message: inputText,
        conversationId: conversationId || undefined,
      });

      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
        const conversations = await api.getAllAIConversations();
        setConversationHistory(conversations);
      }

      const aiResponse = {
        _id: `ai_${Date.now()}`,
        role: "assistant",
        content: response.response,
        timestamp: new Date().toISOString(),
      };
      setMessages([aiResponse, userMessage, ...messages]);
    } catch (error) {
      console.error("Error sending message to AI:", error);
      const errorMessage = {
        _id: `error_${Date.now()}`,
        role: "assistant",
        content: "Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.",
        timestamp: new Date().toISOString(),
      };
      setMessages([errorMessage, userMessage, ...messages]);
    }
  };

  const handleSelectConversation = (selectedConversation) => {
    setConversationId(selectedConversation.conversationId);
    const formattedMessages = selectedConversation.messages
      .map((msg, index) => ({
        _id: `${msg.role}_${index}_${msg.timestamp || Date.now()}`,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
      }))
      .reverse();
    setMessages(formattedMessages);
    setHistoryModalVisible(false);
  };

  const handleCreateNewConversation = () => {
    setConversationId(null);
    setMessages([
      {
        _id: `welcome_${Date.now()}`,
        role: "assistant",
        content: "Xin chào! Tôi là trợ lý Sophy. Bạn cần giúp gì?",
        timestamp: new Date().toISOString(),
      },
    ]);
    setHistoryModalVisible(false);
  };

  const handleSampleQuestion = (question) => {
    setInputText(question);
    setTimeout(handleSendMessage, 0); // Trigger send immediately
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const formatConversationTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()} ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === "assistant"
          ? styles.assistantMessage
          : styles.userMessage,
      ]}
    >
      {item.role === "assistant" && (
        <Image source={AI_LOGO} style={styles.avatar} />
      )}
      <View
        style={[
          styles.messageBox,
          item.role === "assistant" ? styles.assistantBox : styles.userBox,
        ]}
      >
        <View>
          <Text style={styles.messageText}>{item.content}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => handleCopyMessage(item.content)}
            activeOpacity={0.7}
          >
            <Ionicons name="copy-outline" size={18} color={Color.sophy} />
          </TouchableOpacity>
        </View>
        <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
      </View>
    </View>
  );

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleSelectConversation(item)}
      activeOpacity={0.7}
    >
      <View style={styles.conversationContent}>
        <Text style={styles.conversationTitle}>
          Cuộc trò chuyện {item.conversationId.slice(0, 8)}
        </Text>
        <Text style={styles.conversationPreview} numberOfLines={1}>
          {item.messages[item.messages.length - 1]?.content ||
            "Không có tin nhắn"}
        </Text>
        <Text style={styles.conversationTime}>
          {formatConversationTime(item.updatedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSampleQuestion = ({ item }) => (
    <TouchableOpacity
      style={styles.sampleContainer}
      onPress={() => handleSampleQuestion(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.sampleText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={AI_LOGO} style={styles.headerAvatar} />
        <Text style={styles.headerTitle}>Trợ lý Sophy</Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => {
            console.log("History button pressed");
            setHistoryModalVisible(true);
          }}
        >
          <MaterialIcons name="history" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Message List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        inverted={true}
        contentContainerStyle={styles.messageList}
      />

      {/* Sample Questions */}
      <FlatList
        horizontal
        data={SAMPLE_QUESTIONS}
        renderItem={renderSampleQuestion}
        keyExtractor={(item, index) => `sample_${index}`}
        contentContainerStyle={styles.sampleList}
        showsHorizontalScrollIndicator={false}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#555"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          activeOpacity={0.7}
        >
          <Ionicons name="send" size={24} color={Color.white} />
        </TouchableOpacity>
      </View>

      {/* History Modal */}
      <Modal
        visible={historyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lịch sử trò chuyện</Text>
              <View style={styles.modalHeaderButtons}>
                <TouchableOpacity
                  style={styles.createNewButton}
                  onPress={handleCreateNewConversation}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color={Color.sophy}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setHistoryModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#555" />
                </TouchableOpacity>
              </View>
            </View>
            <FlatList
              data={conversationHistory}
              renderItem={renderConversationItem}
              keyExtractor={(item) => item.conversationId}
              contentContainerStyle={styles.historyList}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Không có lịch sử trò chuyện
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafd",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: Color.sophy,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
    marginRight: 40,
  },
  historyButton: {
    padding: 12,
    marginRight: 50,
  },
  messageList: {
    padding: 10,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 5,
    alignItems: "flex-end",
  },
  assistantMessage: {
    justifyContent: "flex-start",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  messageBox: {
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  assistantBox: {
    backgroundColor: "#e6f0ff",
    marginLeft: 10,
  },
  userBox: {
    backgroundColor: "#d4f1ff",
    marginRight: 10,
  },
  messageText: {
    fontSize: 15,
    color: "#222",
  },
  timestamp: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
    textAlign: "right",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  sampleList: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 60,
    marginBottom: 10,
  },
  sampleContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    height: 40,
    justifyContent: "center",
  },
  sampleText: {
    fontSize: 14,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 10,
    fontSize: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: Color.sophy,
    borderRadius: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
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
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
  modalHeaderButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  createNewButton: {
    padding: 5,
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  historyList: {
    padding: 10,
  },
  conversationItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  conversationTime: {
    fontSize: 12,
    color: "#aaa",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
});

export default AiAssistantChatList;
