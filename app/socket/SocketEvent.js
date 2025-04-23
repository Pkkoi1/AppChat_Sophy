export const handleNewMessage = (
  socket,
  conversationId,
  setMessages,
  flatListRef,
  saveMessages
) => {
  if (!socket) return;

  socket.on("newMessage", (newMessage) => {
    if (
      !newMessage?._id ||
      !newMessage?.messageDetailId ||
      newMessage?.isPinned === undefined
    ) {
      console.warn("Invalid message received:", newMessage);
      return;
    }
    setMessages((prev) => {
      const filteredMessages = prev.filter(
        (msg) =>
          !msg._id?.startsWith("temp_") ||
          msg.content !== newMessage.content ||
          msg.createdAt !== newMessage.createdAt
      );
      return [newMessage, ...filteredMessages].filter((msg) => msg);
    });
  });
};

export const cleanupNewMessage = (socket) => {
  if (socket) {
    socket.off("newMessage");
  }
};
