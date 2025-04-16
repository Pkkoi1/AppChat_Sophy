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
  receiver,
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
        data={conversation.messages}
        keyExtractor={(item) => item.messageDetailId || item.message_id}
        renderItem={({ item, index }) => {
          const prevMessage =
            index < conversation.messages.length - 1
              ? conversation.messages[index + 1]
              : null;

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
                    conversation.messages[index - 1].senderId !== item.senderId
                  }
                />
              </Pressable>
            </View>
          );
        }}
        inverted={true}
        initialNumToRender={10} // Render 10 tin nhắn ban đầu
        maxToRenderPerBatch={10} // Render tối đa 10 tin nhắn mỗi lần
        // windowSize={5} // Giữ ít item trong bộ nhớ
        // removeClippedSubviews={true} // Loại bỏ item ngoài màn hình
        keyboardShouldPersistTaps="always"
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
