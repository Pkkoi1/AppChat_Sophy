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
        renderItem={({ item, index }) => {
          const prevMessage =
            index < conversation.messages.length - 1
              ? conversation.messages[index + 1]
              : null;

          const shouldShowTimestamp =
            !prevMessage ||
            moment(item.createdAt).diff(
              moment(prevMessage.createdAt),
              "minutes"
            ) >= 20;

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
