import React, { useContext, useEffect, useState } from "react";
import { FlatList, RefreshControl, View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Inbox from "./Inbox";
import { api } from "@/app/api/api";
import { AuthContext } from "@/app/auth/AuthContext";
import { SocketContext } from "@/app/socket/SocketContext";

const ListInbox = () => {
  const { userInfo } = useContext(AuthContext);
  const socket = useContext(SocketContext); // Access the socket context
  const [refreshing, setRefreshing] = useState(false);
  const [conversations, setConversations] = useState([]);

  const navigation = useNavigation();

  const getConversations = async () => {
    try {
      const response = await api.conversations();
      if (response && response.data) {
        const sortedConversations = response.data.sort((a, b) => {
          const lastChangeDiff =
            new Date(b.lastChange) - new Date(a.lastChange);
          if (lastChangeDiff !== 0) return lastChangeDiff;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setConversations(sortedConversations);
      } else {
        console.error("No conversations found in the response.");
        setConversations([]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    }
  };

  useEffect(() => {
    getConversations();

    if (socket) {
      // Listen for new messages
      socket.on("newMessage", ({ conversationId, message }) => {
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.conversationId === conversationId
              ? {
                  ...conv,
                  lastMessage: message,
                  lastChange: message.createdAt,
                }
              : conv
          )
        );
      });

      // Listen for recalled messages
      socket.on("messageRecalled", ({ conversationId, messageId }) => {
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.conversationId === conversationId
              ? {
                  ...conv,
                  lastMessage:
                    conv.lastMessage?.messageDetailId === messageId
                      ? { ...conv.lastMessage, isRecall: true }
                      : conv.lastMessage,
                }
              : conv
          )
        );
      });

      return () => {
        socket.off("newMessage");
        socket.off("messageRecalled");
      };
    }
  }, [socket]);

  const handlerRefresh = () => {
    setRefreshing(true);
    getConversations().finally(() => setRefreshing(false));
  };

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
              onRefresh={handlerRefresh}
            />
          }
          data={conversations}
          keyExtractor={(item) => item.conversationId.toString()}
          renderItem={({ item }) => (
            <Inbox
              conversation={item} // Pass the updated conversation object
            />
          )}
        />
      )}
    </View>
  );
};

export default ListInbox;
