export const handleNewMessage = (
  socket,
  conversationId,
  setMessages,
  flatListRef
) => {
  if (!socket) return;

  socket.on(
    "newMessage",
    ({ conversationId: incomingConversationId, message }) => {
      if (incomingConversationId === conversationId) {
        const formattedMessage = message._doc || message;

        setMessages((prev) => [formattedMessage, ...prev]);
        flatListRef?.current?.scrollToOffset({ animated: true, offset: 0 });

        console.log("Nhận tin nhắn mới qua socket:", formattedMessage);
      }
    }
  );
};

export const cleanupNewMessage = (socket) => {
  if (socket) {
    socket.off("newMessage");
  }
};
