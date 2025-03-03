import React, { useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import Inbox from "./Inbox";
import conversations from "../../../assets/objects/conversation.json";

const ListInbox = () => {
  const [refreshing, setRefreshing] = useState(false);

  const handlerRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <FlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handlerRefresh} />
        }
        data={conversations}
        keyExtractor={(item) => item.conversation_id.toString()} // Đảm bảo rằng conversation_id là chuỗi
        renderItem={({ item }) => {
          const lastMessage = item.messages[item.messages.length - 1];
          const otherParticipant =
            item.participants.find((p) => p.id !== lastMessage.sender_id) ||
            item.participants[0];
          return (
            <Inbox
              name={otherParticipant.name}
              message={lastMessage.content}
              date={lastMessage.timestamp}
              conversation_id={item.conversation_id} // Truyền conversation_id vào Inbox
            />
          );
        }}
      />
    </View>
  );
};

export default ListInbox;
