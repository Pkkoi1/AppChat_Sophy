import React, { useRef, useEffect } from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import MessageItem from "./MessageItem";
import moment from "moment";
import ConversationStyle from "./ConversationStyle";

const Conversation = ({ conversation, senderId }) => {
  return (
    <FlatList
      data={[...conversation.messages].reverse()}
      keyExtractor={(item) => item.message_id}
      renderItem={({ item, index }) => {
        const prevMessage = index > 0 ? conversation.messages[index - 1] : null;
        const isNewSender =
          !prevMessage || prevMessage.sender_id !== item.sender_id;
        const isTimeGap =
          !prevMessage ||
          moment(item.timestamp).diff(
            moment(prevMessage.timestamp),
            "minutes"
          ) >= 20;

        const showAvatar = isNewSender || isTimeGap;
        const formattedTimestamp =
          moment().diff(moment(item.timestamp), "days") >= 1
            ? moment(item.timestamp).format("HH:mm DD/MM/YYYY")
            : `${moment(item.timestamp).format("HH:mm")} Hôm nay`;

        const avatar = conversation.participants.find(
          (p) => p.id === item.sender_id
        )?.avatar;

        return (
          <View>
            {isTimeGap && (
              <View style={ConversationStyle.timestampContainer}>
                <Text style={ConversationStyle.timestampText}>
                  {formattedTimestamp}
                </Text>
              </View>
            )}
            <MessageItem
              message={item}
              isSender={item.sender_id === senderId}
              avatar={avatar}
            />
          </View>
        );
      }}
      contentContainerStyle={ConversationStyle.conversationContainer}
      inverted={true}
    />
  );
};

export default Conversation;
