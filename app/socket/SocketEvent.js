export const handleNewMessage = (
  socket,
  conversation,
  setMessages,
  flatListRef,
  saveMessages
) => {
  if (!socket) return;

  // Cleanup trước khi đăng ký mới để tránh double listener
  socket.off("newMessage");

  socket.on("newMessage", (newMessage) => {
    console.log("Nhận tin nhắn mới qua socket:", newMessage.message);
    if (
      !newMessage?.message.messageDetailId ||
      newMessage?.message.isPinned === undefined
    ) {
      console.warn("Invalid message received:", newMessage.message);
      return;
    }
    setMessages((prev) => {
      const filteredMessages = prev.filter(
        (msg) =>
          !msg._id?.startsWith("temp_") ||
          msg.content !== newMessage.message.content ||
          msg.createdAt !== newMessage.message.createdAt
      );
      return [newMessage.message, ...filteredMessages].filter((msg) => msg);
    });
  });
  // socket.on("messageRecalled", ({ conversationId, messageId }) => {
  //   if (conversationId === conversation.conversationId) {
  //     setMessages((prev) =>
  //       prev.map((msg) =>
  //         msg.messageDetailId === messageId ? { ...msg, isRecall: true } : msg
  //       )
  //     );
  //   }
  //   console.log(
  //     "Nhận tin nhắn đã thu hồi qua socket:",
  //     conversationId,
  //     messageId
  //   );
  // });
};

export const cleanupNewMessage = (socket) => {
  if (socket) {
    socket.off("newMessage");
  }
};
