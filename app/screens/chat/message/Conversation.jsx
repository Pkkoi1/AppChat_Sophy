import React, { useRef, useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  Pressable,
} from "react-native";
import MessageItem from "./MessageItem";
import moment from "moment";
import ConversationStyle from "./ConversationStyle";
import MessagePopup from "./MessagePopup";

const Conversation = ({ conversation, senderId, searchQuery }) => {
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
        data={[...conversation.messages].reverse()}
        keyExtractor={(item) => item.message_id}
        renderItem={({ item, index }) => {
          const prevMessage =
            index > 0 ? conversation.messages[index - 1] : null;
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

          const reactions = messageReactions[item.message_id] || [];

          return (
            <View>
              {isTimeGap && (
                <View style={ConversationStyle.timestampContainer}>
                  <Text style={ConversationStyle.timestampText}>
                    {formattedTimestamp}
                  </Text>
                </View>
              )}
              <Pressable onLongPress={() => handleLongPress(item)}>
                <View>
                  <MessageItem
                    message={item}
                    isSender={item.sender_id === senderId}
                    avatar={avatar}
                    reactions={reactions}
                    searchQuery={searchQuery}
                  />
                </View>
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