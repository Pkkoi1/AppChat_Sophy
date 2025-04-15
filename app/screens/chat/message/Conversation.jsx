import React, { useRef, useEffect, useState } from "react";
import { View, FlatList, Text, Pressable } from "react-native";
import MessageItem from "./MessageItem";
import moment from "moment";
import ConversationStyle from "./ConversationStyle";
import MessagePopup from "../../../features/messagePopup/MessagePopup";

const Conversation = ({
  conversation,
  senderId,
  highlightedMessageIds = [],
  highlightedMessageId,
  searchQuery = "",
  flatListRef,
  receiver,
}) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});

  useEffect(() => {
    if (!highlightedMessageIds.length || !flatListRef.current) return;

    const lastHighlightedMessageId =
      highlightedMessageIds[highlightedMessageIds.length - 1]; // Lấy tin nhắn cuối cùng tìm thấy

    const messageIndex = conversation.messages.findIndex(
      (msg) => msg.messageDetailId === lastHighlightedMessageId
    );

    if (messageIndex !== -1) {
      flatListRef.current?.scrollToIndex({
        index: messageIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [highlightedMessageIds, conversation.messages]);

  const handleLongPress = (message) => {
    setSelectedMessage(message);
    setPopupVisible(true);
  };

  return (
    <View style={ConversationStyle.conversationContainer}>
      <FlatList
        ref={flatListRef}
        data={conversation.messages}
        keyExtractor={(item) => item.messageDetailId || item.message_id}
        onEndReachedThreshold={0.1}
        renderItem={({ item, index }) => {
          const prevMessage =
            index < conversation.messages.length - 1
              ? conversation.messages[index + 1]
              : null;

          const shouldShowTimestamp =
            !prevMessage || // Show timestamp if there is no previous message
            moment(item.createdAt)
              .startOf("minute")
              .diff(
                moment(prevMessage.createdAt).startOf("minute"),
                "minutes"
              ) >= 5; // Show timestamp if the time difference is 5 minutes or more

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
                  avatar=""
                  isHighlighted={item.messageDetailId === highlightedMessageId}
                  searchQuery={
                    highlightedMessageIds.includes(item.messageDetailId)
                      ? searchQuery
                      : ""
                  }
                />
              </Pressable>
            </View>
          );
        }}
        inverted={true}
        contentContainerStyle={{ paddingBottom: 60 }} // Add padding to avoid overlapping with footer
        // keyboardShouldPersistTaps="always"
      />
      <MessagePopup
        popupVisible={popupVisible}
        setPopupVisible={setPopupVisible}
        selectedMessage={selectedMessage}
        setSelectedMessage={setSelectedMessage}
        messageReactions={messageReactions}
        setMessageReactions={setMessageReactions}
        senderId={senderId}
      />
    </View>
  );
};

export default Conversation;
