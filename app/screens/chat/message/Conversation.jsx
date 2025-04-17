import React, { useState } from "react";
import { View, FlatList, Text, Pressable } from "react-native";
import MessageItem from "./MessageItem";
import moment from "moment";
import ConversationStyle from "./ConversationStyle";
import MessagePopup from "../../../features/messagePopup/MessagePopup";

const Conversation = ({
  messages,
  setMessages, // Use messages and setMessages from props
  senderId,
  highlightedMessageIds = [],
  highlightedMessageId,
  searchQuery = "",
  receiver,
  onTyping, // Use onTyping prop to control typing indicator
}) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});

  const handleLongPress = (message) => {
    setSelectedMessage(message);
    setPopupVisible(true);
  };

  return (
    <View style={ConversationStyle.conversationContainer}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.messageDetailId || item.message_id}
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
                  isHighlighted={item.messageDetailId === highlightedMessageId}
                  searchQuery={
                    highlightedMessageIds.includes(item.messageDetailId)
                      ? searchQuery
                      : ""
                  }
                  isFirstMessageFromSender={
                    index === 0 ||
                    messages[index - 1].senderId !== item.senderId
                  }
                />
              </Pressable>
            </View>
          );
        }}
        inverted={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        keyboardShouldPersistTaps="always"
      />
      {onTyping && ( // Show typing indicator based on onTyping prop
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
        setMessages={setMessages} // Pass setMessages to update the message list
      />
    </View>
  );
};

export default Conversation;
