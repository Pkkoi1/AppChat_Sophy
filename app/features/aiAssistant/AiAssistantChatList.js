import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { Clipboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import aiLogo from "../../../assets/images/AI.png";
import { api } from "../../api/api";
import Color from "../../components/colors/Color";
import { useNavigation } from "@react-navigation/native";

const AI_LOGO = aiLogo;
const AI_ASSISTANT_ID = "rai-assistant";

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
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isAITyping, setIsAITyping] = useState(false);
  const navigation = useNavigation();

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
      return;
    }
    Clipboard.setString(content);
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
    setIsAITyping(true);

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
    } finally {
      setIsAITyping(false);
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
  };

  const handleSampleQuestion = (question) => {
    setInputText(question);
    setTimeout(handleSendMessage, 0);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
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
            <Ionicons name="copy-outline" size={18} color={Color.grayText} />
          </TouchableOpacity>
        </View>
        <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
      </View>
    </View>
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

  // Hiệu ứng bong bóng AI typing
  const renderAITypingBubble = () => (
    <View style={[styles.messageContainer, styles.assistantMessage]}>
      <Image source={AI_LOGO} style={styles.avatar} />
      <View
        style={[
          styles.messageBox,
          styles.assistantBox,
          { flexDirection: "row", alignItems: "center" },
        ]}
      >
        <View style={styles.typingBubble}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={AI_LOGO} style={styles.headerAvatar} />
        <Text style={styles.headerTitle}>Trợ lý Sophy</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.createNewButton}
            onPress={handleCreateNewConversation}
          >
            <Ionicons name="add-circle-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() =>
              navigation.navigate("AiAssistantHistory", {
                conversationHistory,
                handleSelectConversation,
                handleCreateNewConversation,
              })
            }
          >
            <MaterialIcons name="history" size={28} color="#fff" />
          </TouchableOpacity>
          {/* Nút đóng ở cùng hàng với 2 nút trên */}
          <TouchableOpacity
            style={[styles.createNewButton, { marginLeft: 4 }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={
          isAITyping
            ? [{ _id: "ai_typing", role: "ai_typing" }, ...messages]
            : messages
        }
        renderItem={({ item }) =>
          item.role === "ai_typing"
            ? renderAITypingBubble()
            : renderMessage({ item })
        }
        keyExtractor={(item) => item._id}
        inverted={true}
        contentContainerStyle={styles.messageList}
      />

      <FlatList
        horizontal
        data={SAMPLE_QUESTIONS}
        renderItem={renderSampleQuestion}
        keyExtractor={(item, index) => `sample_${index}`}
        contentContainerStyle={styles.sampleList}
        showsHorizontalScrollIndicator={false}
      />

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
    marginRight: 10,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  createNewButton: {
    padding: 8,
    borderRadius: 20,
  },
  historyButton: {
    padding: 8,
    borderRadius: 20,
    // marginRight: 50, // Adjusted to fit the layout
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
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#e6f0ff",
    borderRadius: 16,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#8bb6f7",
    marginHorizontal: 2,
    opacity: 0.8,
    // Có thể thêm hiệu ứng động nếu muốn
  },
});

export default AiAssistantChatList;
