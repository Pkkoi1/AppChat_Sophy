import React, { useRef, useEffect, useState } from "react";
import { View, FlatList, Text, Pressable } from "react-native";
import MessageItem from "./MessageItem";
import moment from "moment";
import ConversationStyle from "./ConversationStyle";
import MessagePopup from "./MessagePopup";

const Conversation = ({
  conversation,
  senderId,
  highlightedMessageIds = [],
  highlightedMessageId,
  searchQuery = "",
  flatListRef,
  isManualScroll,
  setIsManualScroll,
  receiverId,
}) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  // Đảo ngược danh sách tin nhắn
  const reversedMessages = [...conversation.messages].reverse();

  useEffect(() => {
    if (reversedMessages.length === 0) {
      console.warn("Danh sách tin nhắn trống, không thể cuộn.");
      return;
    }
    if (!isManualScroll && highlightedMessageIds.length > 0) {
      const firstMessageId = highlightedMessageIds[0];
      const originalIndex = reversedMessages.findIndex(
        (msg) => msg.message_id === firstMessageId
      );

      if (originalIndex >= 0 && originalIndex < reversedMessages.length) {
        flatListRef.current?.scrollToIndex({
          index: originalIndex,
          animated: true,
          viewPosition: 0.5,
        });
      } else {
        console.warn("Index không hợp lệ:", originalIndex);
      }
    }
  }, [highlightedMessageIds, reversedMessages, isManualScroll]);

  const handleLongPress = (message) => {
    setSelectedMessage(message);
    setPopupVisible(true);
  };

  return (
    <View style={ConversationStyle.conversationContainer}>
      <FlatList
        ref={flatListRef}
        data={reversedMessages}
        keyExtractor={(item) =>
          item.message_id || item._id || item.messageDetailId
        }
        renderItem={({ item, index }) => {
          const prevMessage =
            index < reversedMessages.length - 1
              ? reversedMessages[index + 1]
              : null;

          const timeDiff = prevMessage
            ? moment(item.createdAt).diff(
                moment(prevMessage.createdAt),
                "minutes"
              )
            : null;

          const shouldShowTimestamp = !prevMessage || timeDiff >= 20;

          const formattedTimestamp = moment(item.createdAt).format(
            "HH:mm DD/MM/YYYY"
          );

          const avatar = conversation.participants.find(
            (p) => p.id === item.sender_id
          )?.avatar;

          return (
            <View>
              {shouldShowTimestamp && (
                <View style={ConversationStyle.timestampContainer}>
                  <Text style={ConversationStyle.timestampText}>
                    {formattedTimestamp}
                  </Text>
                </View>
              )}
              <Pressable onLongPress={() => handleLongPress(item)}>
                <MessageItem
                  message={item}
                  receiverId={receiverId}
                  isSender={item.senderId === senderId}
                  avatar={avatar}
                  isHighlighted={item.message_id === highlightedMessageId}
                  searchQuery={
                    highlightedMessageIds.includes(item.message_id)
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
