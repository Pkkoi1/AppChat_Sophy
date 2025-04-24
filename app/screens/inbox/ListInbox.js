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

  if (socket && socket.connected) {
    socket.on("newMessage", async () => {
      console.log(
        "New message received. Refreshing conversations at listInbox..."
      );
      await handlerRefresh(); // Refresh the conversation list
    });
    socket.on("newConversation", ({ conversation, timestamp }) => {
      console.log("New conversation received. Refreshing conversations...");
      addConversation(conversation); // Add the new conversation to the list
    });
    socket.on("groupDeleted", async () => {
      console.log("Group deleted. Refreshing conversations 1...");
      // await handlerRefresh(); // Refresh the conversation list
    });
  }
  useEffect(() => {
    if (socket && socket.connected) {
      // Listen for newMessage event
      socket.on("newMessage", async () => {
        console.log("New message received. Refreshing conversations...");
        await handlerRefresh(); // Refresh the conversation list
      });
      if (socket && socket.connected) {
        socket.on("newConversation", ({ conversation, timestamp }) => {
          console.log(
            "New conversation received. Refreshing conversations 1..."
          );
          addConversation(conversation); // Add the new conversation to the list
        });
      }
    }
  }, []);

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
