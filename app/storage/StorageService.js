import * as FileSystem from "expo-file-system";
const { StorageAccessFramework } = FileSystem;

import AsyncStorage from "@react-native-async-storage/async-storage";

const DIRECTORY_KEY = "SHOPY_DIRECTORY_URI";

// Chọn thư mục ngoài và lưu lại URI
export const pickExternalDirectory = async () => {
  try {
    const dirUri =
      await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (dirUri.granted) {
      await AsyncStorage.setItem(DIRECTORY_KEY, dirUri.directoryUri);
      console.log("✅ Thư mục được chọn:", dirUri.directoryUri);
      return dirUri.directoryUri;
    } else {
      throw new Error("❌ Người dùng từ chối chọn thư mục");
    }
  } catch (err) {
    console.error("Lỗi khi chọn thư mục:", err);
    throw err;
  }
};

// Lấy thư mục đã chọn
const getBaseDir = async () => {
  const uri = await AsyncStorage.getItem(DIRECTORY_KEY);
  if (!uri)
    throw new Error(
      "❌ Chưa có thư mục nào được chọn. Gọi pickExternalDirectory() trước."
    );
  return uri;
};

// Viết file JSON ra external storage
const writeFile = async (fileName, data) => {
  try {
    const dirUri = await getBaseDir();
    const content = JSON.stringify(data);
    const fileUri = await StorageAccessFramework.createFileAsync(
      dirUri,
      fileName,
      "application/json"
    );
    await FileSystem.writeAsStringAsync(fileUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    console.log("✅ Đã lưu:", fileUri);
  } catch (err) {
    console.error("Lỗi khi ghi file:", err);
    throw err;
  }
};

// Đọc file JSON từ external
const readFile = async (fileName) => {
  try {
    const dirUri = await getBaseDir();
    const files = await StorageAccessFramework.readDirectoryAsync(dirUri);
    const target = files.find((f) => f.endsWith(`/${fileName}`));
    if (!target) return [];

    const content = await FileSystem.readAsStringAsync(target, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return content ? JSON.parse(content) : [];
  } catch (err) {
    console.error("Lỗi khi đọc file:", err);
    return [];
  }
};

// ========== CONVERSATIONS ==========
export const getConversations = async () => {
  return readFile("conversations.json");
};

export const saveConversations = async (data) => {
  const MAX_CONVERSATIONS = 100;
  const limited = data.slice(0, MAX_CONVERSATIONS);
  await writeFile("conversations.json", limited);
  return limited;
};

// ========== MESSAGES ==========
export const getMessages = async (conversationId) => {
  return readFile(`messages_${conversationId}.json`);
};

export const saveMessages = async (
  conversationId,
  newMessages,
  direction = "after"
) => {
  const fileName = `messages_${conversationId}.json`;
  const oldMessages = await getMessages(conversationId);
  const merged =
    direction === "before"
      ? [...newMessages, ...oldMessages]
      : [...oldMessages, ...newMessages];

  const deduped = Array.from(
    new Map(
      merged
        .filter((m) => m && m.messageDetailId)
        .map((m) => [m.messageDetailId, m])
    ).values()
  );

  const MAX_MESSAGES = 1000;
  const limitedMessages = deduped.slice(0, MAX_MESSAGES);

  await writeFile(fileName, limitedMessages);
  return limitedMessages;
};

export const appendMessage = async (conversationId, message) => {
  return saveMessages(conversationId, [message], "before");
};

// ========== FRIENDS ==========
export const getFriends = async () => {
  return readFile("friends.json");
};

export const saveFriends = async (data) => {
  await writeFile("friends.json", data);
};

// ========== ATTACHMENTS ==========
// Hiện tại vẫn lưu nội bộ, có thể mở rộng dùng StorageAccessFramework nếu cần
export const saveAttachment = async (uri, fileName) => {
  console.warn(
    "Chức năng lưu file đính kèm vào external chưa được hoàn thiện."
  );
  return uri;
};

export const deleteAttachment = async (filePath) => {
  try {
    await FileSystem.deleteAsync(filePath, { idempotent: true });
  } catch (err) {
    console.error("Lỗi khi xóa đính kèm:", err);
  }
};

// ========== CLEAR ==========
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.removeItem(DIRECTORY_KEY);
    console.log("Đã xóa thông tin thư mục lưu.");
  } catch (err) {
    console.error("Lỗi khi xóa URI lưu:", err);
  }
};

export const checkStoragePaths = async () => {
  try {
    const dirUri = await getBaseDir();
    const files = await StorageAccessFramework.readDirectoryAsync(dirUri);
    console.log("📂 File hiện có:", files);
    return files;
  } catch (err) {
    console.error("Lỗi kiểm tra file:", err);
    return [];
  }
};
