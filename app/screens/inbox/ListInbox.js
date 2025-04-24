import React, { useContext, useState, useEffect } from "react";
import { FlatList, RefreshControl, View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Inbox from "./Inbox";
import { AuthContext } from "@/app/auth/AuthContext";
import { SocketContext } from "@/app/socket/SocketContext";

const ListInbox = () => {
  const { conversations, handlerRefresh, addConversation } =
    useContext(AuthContext); // Use handlerRefresh from AuthContext
  const socket = useContext(SocketContext); // Use SocketContext
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await handlerRefresh(); // Call handlerRefresh to fetch updated conversations
    } catch (error) {
      console.error("Error refreshing conversations:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (socket && socket.connected) {
      const handleNewMessage = async () => {
        console.log(
          "New message received. Refreshing conversations at ListInbox..."
        );
        await handlerRefresh();
      };

      const handleNewConversation = ({ conversation }) => {
        console.log(
          "New conversation received. Refreshing conversations at ListInbox..."
        );
        addConversation(conversation);
      };

      const handleGroupDeleted = async () => {
        console.log("Group deleted. Refreshing conversations...");
        await handlerRefresh();
      };

      socket.on("newMessage", handleNewMessage);
      socket.on("newConversation", handleNewConversation);
      socket.on("groupDeleted", handleGroupDeleted);

      return () => {
        socket.off("newMessage", handleNewMessage);
        socket.off("newConversation", handleNewConversation);
        socket.off("groupDeleted", handleGroupDeleted);
      };
    }
  }, [socket, handlerRefresh, addConversation]);

  return (
    <View style={{ flex: 1, width: "100%" }}>
      {conversations.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 16, color: "#666" }}>
            Bạn chưa có tin nhắn nào.
          </Text>
        </View>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh} // Use onRefresh
            />
          }
          data={conversations} // Use conversations from AuthContext
          keyExtractor={(item) => item.conversationId.toString()} // Ensure conversationId is a string
          renderItem={({ item }) => (
            <Inbox
              conversation={item} // Pass the entire conversation object
            />
          )}
        />
      )}
    </View>
  );
};

export default ListInbox;
