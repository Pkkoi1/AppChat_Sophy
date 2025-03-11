import React, { useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Inbox from "./Inbox";
import conversations from "../../../assets/objects/conversation.json";

const ListInbox = ({ userId }) => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const handlerRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  // Filter conversations where any participant's ID matches the userId
  const filteredConversations = conversations.filter((conversation) =>
    conversation.participants.some((participant) => participant.id === userId)
  );

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <FlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handlerRefresh} />
        }
        data={filteredConversations}
        keyExtractor={(item) => item.conversation_id.toString()} // Ensure conversation_id is a string
        renderItem={({ item }) => {
          const lastMessage = item.messages[item.messages.length - 1];
          const otherParticipant = item.participants.find(
            (p) => p.id !== userId
          ) || { name: "Unknown", avatar: null }; // Default value if otherParticipant is null

          const avatar =
            otherParticipant.avatar ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbHfn_ap7TA8_f2b-QWEdQWRTtlI8U5strBQ&s";

          return (
            <Inbox
              name={otherParticipant.name}
              avatar={avatar} // Pass avatar to Inbox
              message={lastMessage.content}
              date={lastMessage.timestamp}
              conversation_id={item.conversation_id}
              user_id={userId} // Pass user_id to Inbox
            />
          );
        }}
      />
    </View>
  );
};

export default ListInbox;
