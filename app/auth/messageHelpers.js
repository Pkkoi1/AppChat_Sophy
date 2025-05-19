import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Lưu tin nhắn cho một cuộc trò chuyện.
 * @param {Function} setConversations - Hàm setState conversations.
 * @param {string} conversationId - ID cuộc trò chuyện.
 * @param {Array} newMessages - Danh sách tin nhắn mới.
 * @param {string} position - "before" hoặc "after".
 * @param {Function} onSaveComplete - Callback khi lưu xong.
 * @returns {Promise<Array>}
 */
export const saveMessages = async (
  setConversations,
  conversationId,
  newMessages,
  position = "before",
  onSaveComplete
) => {
  try {
    const conversationsJSON = await AsyncStorage.getItem("conversations");
    let allConversations = conversationsJSON
      ? JSON.parse(conversationsJSON)
      : [];

    const conversationIndex = allConversations.findIndex(
      (conv) => conv.conversationId === conversationId
    );

    let conversation;
    if (conversationIndex !== -1) {
      conversation = allConversations[conversationIndex];
    } else {
      return [];
    }

    const existingMessages = conversation.messages || [];

    const sortedNewMessages = [...newMessages].sort(
      (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
    );

    let updatedMessages;
    if (position === "before") {
      updatedMessages = [...sortedNewMessages, ...existingMessages];
    } else {
      updatedMessages = [...existingMessages, ...sortedNewMessages];
    }

    updatedMessages = Array.from(
      new Map(
        updatedMessages.map((msg) => [msg?.messageDetailId, msg])
      ).values()
    ).sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));

    const updatedConversation = {
      ...conversation,
      messages: updatedMessages,
      lastMessage:
        sortedNewMessages[0] || updatedMessages[0] || conversation.lastMessage,
    };

    allConversations[conversationIndex] = updatedConversation;

    allConversations = allConversations.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt)
        : new Date(0);
      const timeB = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt)
        : new Date(0);
      return timeB - timeA;
    });

    await AsyncStorage.setItem(
      "conversations",
      JSON.stringify(allConversations)
    );

    setConversations((prev) => {
      const prevIds = prev.map((c) => c.conversationId);
      const newIds = allConversations.map((c) => c.conversationId);
      if (JSON.stringify(prevIds) === JSON.stringify(newIds)) {
        return allConversations;
      }
      return [...allConversations];
    });

    if (onSaveComplete) {
      onSaveComplete(updatedMessages);
    }

    return updatedMessages;
  } catch (error) {
    return [];
  }
};

/**
 * Lấy tin nhắn của một cuộc trò chuyện.
 * @param {string} conversationId - ID cuộc trò chuyện.
 * @returns {Promise<Array>}
 */
export const getMessages = async (conversationId) => {
  try {
    const conversationsJSON = await AsyncStorage.getItem("conversations");
    const conversations = conversationsJSON
      ? JSON.parse(conversationsJSON)
      : [];
    const conversation = conversations.find(
      (conv) => conv.conversationId === conversationId
    );
    return conversation?.messages || [];
  } catch (error) {
    return [];
  }
};
