import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  Text,
  Pressable,
  TouchableOpacity,
  Modal,
  Animated,
} from "react-native";
import MessageItem from "./MessageItem";
import moment from "moment";
import ConversationStyle from "./ConversationStyle";
import MessagePopup from "../../../features/messagePopup/MessagePopup";
import PinnedMessage from "./PinnedMessage";
import { AuthContext } from "@/app/auth/AuthContext";
import { Feather } from "@expo/vector-icons";

const Conversation = ({
  messages,
  setMessages,
  notifications,
  senderId,
  highlightedMessageIds = [],
  highlightedMessageId,
  searchQuery = "",
  receiver,
  onTyping,
  onReply,
  flatListRef, // Receive FlatList ref from MessageScreen
  onScrollToMessage, // Receive scrollToMessage from MessageScreen
  conversationId, // Nhận conversationId
  fetchMessages, // Nhận fetchMessages
}) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [pinnedModalVisible, setPinnedModalVisible] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  console.log("messages", messages);
  const pinnedMessages = messages.filter(
    (msg) => msg && typeof msg === "object" && msg.isPinned
  );
  const { userInfo } = useContext(AuthContext); // Assuming you have a UserContext to get user info

  const handleLongPress = (message) => {
    if (message.type !== "notification") {
      setSelectedMessage(message);
      setPopupVisible(true);
    }
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollToBottom(offsetY > 100); // Show button if scrolled up by 100px
  };

  const scrollToBottom = () => {
    if (flatListRef?.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      setShowScrollToBottom(false); // Hide button after scrolling
    }
  };

  return (
    <View style={ConversationStyle.conversationContainer}>
      {pinnedMessages.length > 0 && (
        <TouchableOpacity
          style={ConversationStyle.pinnedButton}
          onPress={() => setPinnedModalVisible(true)}
        >
          <View style={ConversationStyle.pinnedButtonContent}>
            <Text style={ConversationStyle.pinnedButtonText}>
              Tin nhắn của{" "}
              {pinnedMessages[pinnedMessages.length - 1].senderId ===
              userInfo.userId
                ? userInfo.fullname
                : receiver?.fullname || "Người dùng"}
              : {pinnedMessages[pinnedMessages.length - 1].content}
            </Text>
            {pinnedMessages.length > 1 && (
              <Text style={ConversationStyle.pinnedCount}>
                +{pinnedMessages.length - 1}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      )}
      <FlatList
        ref={flatListRef} // Use FlatList ref passed from MessageScreen
        data={messages} // Show all messages, including recalled ones
        keyExtractor={(item) => item.messageDetailId}
        renderItem={({ item, index }) => {
          const prevMessage =
            index < messages.length - 1 ? messages[index + 1] : null;

          const shouldShowTimestamp =
            !prevMessage ||
            moment(item.createdAt)
              .startOf("minute")
              .diff(
                moment(prevMessage.createdAt).startOf("minute"),
                "minutes"
              ) >= 10;

          return (
            <View>
              {shouldShowTimestamp && (
                <View style={ConversationStyle.timestampContainer}>
                  <Text style={ConversationStyle.timestampText}>
                    {moment(item.createdAt).format("HH:mm DD/MM/YYYY")}
                  </Text>
                </View>
              )}
              <Pressable onLongPress={() => handleLongPress(item)}>
                <MessageItem
                  message={item}
                  receiver={receiver}
                  isSender={item.senderId === senderId}
                  isHighlighted={item.messageDetailId === highlightedMessageId} // Highlight the message
                  searchQuery={
                    highlightedMessageIds.includes(item.messageDetailId)
                      ? searchQuery
                      : ""
                  }
                  isFirstMessageFromSender={
                    index === 0 ||
                    messages[index - 1].senderId !== item.senderId
                  }
                  onScrollToMessage={onScrollToMessage} // Pass scrollToMessage to MessageItem
                />
              </Pressable>
            </View>
          );
        }}
        inverted={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        keyboardShouldPersistTaps="always"
        onScroll={handleScroll} // Track scroll position
        scrollEventThrottle={16}
      />
      {showScrollToBottom && (
        <TouchableOpacity
          style={ConversationStyle.scrollToBottomButton}
          onPress={scrollToBottom}
        >
          <Text style={ConversationStyle.scrollToBottomText}>
            <Feather name="chevrons-down" size={24} color="black" />
          </Text>
        </TouchableOpacity>
      )}
      {onTyping && (
        <View style={ConversationStyle.typingIndicatorContainer}>
          <Text style={ConversationStyle.typingIndicatorText}>
            Đang soạn tin ...
          </Text>
        </View>
      )}
      <MessagePopup
        popupVisible={popupVisible}
        setPopupVisible={setPopupVisible}
        selectedMessage={selectedMessage}
        setSelectedMessage={setSelectedMessage}
        messageReactions={messageReactions}
        setMessageReactions={setMessageReactions}
        senderId={senderId}
        setMessages={setMessages}
        messages={messages}
        onReply={onReply}
        onScrollToMessage={onScrollToMessage} // Pass scrollToMessage to MessagePopup
        conversationId={conversationId} // Truyền conversationId
        fetchMessages={fetchMessages} // Truyền fetchMessages
      />
      <Modal
        visible={pinnedModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPinnedModalVisible(false)}
      >
        <PinnedMessage
          receiver={receiver}
          pinnedMessages={pinnedMessages}
          onClose={() => setPinnedModalVisible(false)}
          onScrollToMessage={onScrollToMessage} // Pass scrollToMessage to PinnedMessage
        />
      </Modal>
    </View>
  );
};

export default Conversation;
