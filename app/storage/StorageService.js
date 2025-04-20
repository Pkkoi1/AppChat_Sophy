// storageService.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  conversations: "conversations",
  messages: (conversationId) => `messages:${conversationId}`,
  friends: "friends",
  userInfo: "userInfo",
};

// ========== GENERIC ==========
const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error("Lỗi khi getItem:", key, err);
    return null;
  }
};

const setItem = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("Lỗi khi setItem:", key, err);
  }
};

const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.error("Lỗi khi removeItem:", key, err);
  }
};

// ========== CONVERSATIONS ==========
export const getConversations = () => getItem(STORAGE_KEYS.conversations);
export const saveConversations = (data) =>
  setItem(STORAGE_KEYS.conversations, data);

// ========== MESSAGES ==========
export const getMessages = async (conversationId) => {
  const key = STORAGE_KEYS.messages(conversationId);
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const saveMessages = async (
  conversationId,
  newMessages,
  direction = "after"
) => {
  const key = STORAGE_KEYS.messages(conversationId);
  const old = (await getMessages(conversationId)) || [];

  const merged = [...newMessages, ...old];

  // Remove duplicates by message ID
  const deduped = Array.from(
    new Map(
      merged
        .filter((m) => m && m.messageDetailId) // Kiểm tra m có tồn tại và có messageDetailId
        .map((m) => [m.messageDetailId, m])
    ).values()
  );

  await AsyncStorage.setItem(key, JSON.stringify(deduped));
  return deduped;
};

export const appendMessage = async (conversationId, message) => {
  return saveMessages(conversationId, [message], "before");
};
// ========== FRIENDS ==========
export const getFriends = () => getItem(STORAGE_KEYS.friends);
export const saveFriends = (data) => setItem(STORAGE_KEYS.friends, data);

// ========== CLEAR ==========
export const clearConversationMessages = (conversationId) =>
  removeItem(STORAGE_KEYS.messages(conversationId));

export const clearAllStorage = async () => {
  await AsyncStorage.clear();
};
