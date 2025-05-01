import * as FileSystem from "expo-file-system";
const { StorageAccessFramework } = FileSystem;

import AsyncStorage from "@react-native-async-storage/async-storage";

const DIRECTORY_KEY = "SHOPY_DIRECTORY_URI";
let isWriting = false;

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

const handleStorageError = async (error) => {
  if (error.message.includes("isn't readable")) {
    console.warn(
      "⚠️ Thư mục không thể đọc được. Đang yêu cầu cấp lại quyền..."
    );
    try {
      const dirUri =
        await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (dirUri.granted) {
        await AsyncStorage.setItem(DIRECTORY_KEY, dirUri.directoryUri);
        console.log(
          "✅ Quyền đã được cấp lại cho thư mục:",
          dirUri.directoryUri
        );
      } else {
        console.error("❌ Người dùng từ chối cấp quyền.");
      }
    } catch (err) {
      console.error("❌ Lỗi khi yêu cầu cấp lại quyền:", err);
    }
  } else {
    console.error("❌ Lỗi không xác định:", error);
  }
};

const getBaseDir = async () => {
  const uri = await AsyncStorage.getItem(DIRECTORY_KEY);
  if (!uri) throw new Error("❌ Chưa có thư mục nào được chọn.");
  return uri;
};

const getUserFileName = async () => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) return null;
  return `user_${userId}.json`;
};

const readUserData = async () => {
  const fileName = await getUserFileName();
  console.log("Đang đọc file:", fileName);
  if (!fileName) return {};
  return (await readFile(fileName)) || {};
};

const writeUserData = async (data) => {
  const fileName = await getUserFileName();
  if (!fileName) {
    console.warn("⛔ Không thể ghi file vì chưa có userId.");
    return;
  }
  await writeFile(fileName, data);
};

const writeQueue = [];

const writeFile = async (fileName, data) => {
  const writePromise = new Promise(async (resolve, reject) => {
    const executeWrite = async () => {
      try {
        const dirUri = await getBaseDir();

        const cleanData = JSON.parse(
          JSON.stringify(data, (key, value) => {
            if (typeof value === "undefined" || typeof value === "function") {
              return null;
            }
            if (
              typeof value === "boolean" &&
              value !== true &&
              value !== false
            ) {
              console.warn("❌ Giá trị boolean không hợp lệ:", value);
              return null;
            }
            return value;
          })
        );

        let content;
        try {
          content = JSON.stringify(cleanData, null, 2);
          JSON.parse(content);
        } catch (err) {
          console.error("❌ Lỗi serialize dữ liệu:", err);
          await debugFileContent(fileName);
          throw new Error("Dữ liệu không thể serialize thành JSON hợp lệ");
        }

        const files = await StorageAccessFramework.readDirectoryAsync(dirUri);
        const cleanFileName = fileName.replace(/ \(\d+\)\.json$/, ".json");
        const existingFileUri = files.find((uri) => {
          const decodedUri = decodeURIComponent(uri);
          return (
            decodedUri.endsWith(`/${cleanFileName}`) ||
            decodedUri.match(
              new RegExp(
                `/${cleanFileName.replace(".json", "")}\\s*\\(\\d+\\)\\.json$`
              )
            )
          );
        });

        let fileUri;
        if (existingFileUri) {
          fileUri = existingFileUri;
        } else {
          fileUri = await StorageAccessFramework.createFileAsync(
            dirUri,
            cleanFileName.replace(".json", ""),
            "application/json"
          );
          console.log("✅ Tạo tệp mới:", fileUri);
        }

        await FileSystem.writeAsStringAsync(fileUri, content, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const duplicateFiles = files.filter((uri) => {
          const decodedUri = decodeURIComponent(uri);
          return (
            decodedUri.match(
              new RegExp(
                `/${cleanFileName.replace(".json", "")}\\s*\\(\\d+\\)\\.json$`
              )
            ) && uri !== fileUri
          );
        });

        for (const duplicate of duplicateFiles) {
          await FileSystem.deleteAsync(duplicate, { idempotent: true });
          console.log("🗑️ Đã xóa tệp trùng lặp:", duplicate);
        }

        resolve();
      } catch (err) {
        console.error("❌ Lỗi ghi tệp:", err);
        await handleStorageError(err);
        reject(err);
      }
    };

    writeQueue.push(executeWrite);
    if (!isWriting) {
      isWriting = true;
      while (writeQueue.length > 0) {
        const nextWrite = writeQueue.shift();
        await nextWrite();
      }
      isWriting = false;
    }
  });

  return writePromise;
};

const readFile = async (fileName) => {
  try {
    const dirUri = await getBaseDir();
    const files = await StorageAccessFramework.readDirectoryAsync(dirUri);
    const cleanFileName = fileName;
    const target = files.find((f) => {
      const decoded = decodeURIComponent(f);
      return (
        decoded.includes(`/${cleanFileName}`) ||
        decoded.includes(`%2F${cleanFileName}`)
      );
    });

    if (!target) {
      console.warn(
        "❌ Không tìm thấy file trùng tên trong thư mục:",
        cleanFileName
      );
      console.log(
        "📂 Tệp hiện có:",
        files.map((f) => decodeURIComponent(f))
      );
    }

    const content = await FileSystem.readAsStringAsync(target, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    // console.log("📄 Đã đọc tệp:", target);
    // console.log("📄 Nội dung tệp:", content);
    if (!content) return null;

    try {
      return content.message;
    } catch (err) {
      if (!target.includes("Sophy")) {
        await FileSystem.deleteAsync(target, { idempotent: true });
      } else {
        console.warn("⚠️ Bỏ qua xóa tệp trong thư mục Sophy:", target);
      }
      return null;
    }
  } catch (err) {
    console.error("❌ Lỗi đọc tệp:", err);
    await handleStorageError(err);
    return null;
  }
};

export const debugFileContent = async (fileName) => {
  try {
    const dirUri = await getBaseDir();
    const files = await StorageAccessFramework.readDirectoryAsync(dirUri);
    const cleanFileName = fileName.replace(/ \(\d+\)\.json$/, ".json");
    const target = files.find((f) => {
      const decoded = decodeURIComponent(f);
      return (
        decoded.includes(`/${cleanFileName}`) ||
        decoded.includes(`%2F${cleanFileName}`)
      );
    });

    if (!target) {
      console.log("❌ Không tìm thấy file:", fileName);
      return;
    }

    const content = await FileSystem.readAsStringAsync(target, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    console.log("📄 Nội dung file:", content);
    try {
      const parsed = JSON.parse(content);
      console.log("✅ JSON hợp lệ:", parsed);
    } catch (err) {
      console.error("❌ JSON không hợp lệ:", err.message);
    }
  } catch (err) {
    console.error("Lỗi khi đọc nội dung file:", err);
  }
};

export const getConversations = async () => {
  const data = await readUserData();
  return data.conversations || [];
};

export const saveConversations = async (conversations) => {
  const data = await readUserData();
  const MAX_CONVERSATIONS = 100;
  data.conversations = conversations.slice(0, MAX_CONVERSATIONS);
  await writeUserData(data);
  const verify = await readUserData();
  console.log("✅ Đã lưu, kiểm tra lại messages:", verify.messages);

  return data.conversations;
};

export const getMessages = async (conversationId) => {
  const data = await readUserData();
  const messages = data.messages?.[conversationId] || [];
  console.log("Data từ readUserData:", data);

  // Ensure messages are returned as an array
  if (Array.isArray(messages) && messages.length > 0) {
    return messages.map((msg) => ({
      ...msg,
      replyData: msg.replyData || null, // Ensure replyData is not undefined
    }));
  }

  // Fallback to lastMessage if no messages are found
  const conversation = data.conversations?.find(
    (conv) => conv.conversationId === conversationId
  );
  if (conversation?.lastMessage) {
    return [
      {
        messageDetailId: conversation.newestMessageId,
        content: conversation.lastMessage.content,
        type: conversation.lastMessage.type,
        senderId: conversation.lastMessage.senderId,
        createdAt: conversation.lastMessage.createdAt,
      },
    ];
  }

  return [];
};

export const saveMessages = async (
  conversationId,
  newMessages,
  direction = "after"
) => {
  const data = await readUserData();
  const oldMessages = data.messages?.[conversationId] || [];

  // Loại bỏ tin nhắn trùng lặp dựa trên messageDetailId
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

  // Giới hạn số lượng tin nhắn
  const MAX_MESSAGES = 1000;
  const limited = deduped.slice(0, MAX_MESSAGES);

  // Khởi tạo messages nếu chưa tồn tại
  if (!data.messages) data.messages = {};
  data.messages[conversationId] = limited;

  // Cập nhật lastMessage trong conversation
  const latestMessage = limited.find(
    (m) => m.messageDetailId === limited[limited.length - 1]?.messageDetailId
  );
  if (latestMessage) {
    const conversation = data.conversations?.find(
      (conv) => conv.conversationId === conversationId
    );
    if (conversation) {
      conversation.lastMessage = {
        content: latestMessage.content,
        type: latestMessage.type,
        senderId: latestMessage.senderId,
        createdAt: latestMessage.createdAt,
      };
      conversation.newestMessageId = latestMessage.messageDetailId;
      conversation.lastChange = latestMessage.createdAt;
    }
  }

  await writeUserData(data);
  const verify = await readUserData();
  console.log("✅ Đã lưu, kiểm tra lại messages:", verify.messages);

  console.log("💾 Đang lưu tin nhắn cho:", conversationId);
  console.log("🔢 Số lượng mới:", newMessages.length);
  console.log("📦 Tổng sau merge:", limited.length);

  return limited;
};

export const appendMessage = async (conversationId, message) => {
  return saveMessages(conversationId, [message], "before");
};

export const getFriends = async () => {
  const data = await readUserData();
  return data.friends || [];
};

export const saveFriends = async (friends) => {
  const data = await readUserData();
  data.friends = friends;
  await writeUserData(data);
  const verify = await readUserData();
  console.log("✅ Đã lưu, kiểm tra lại messages:", verify.messages);
};

export const getBackground = async () => {
  const data = await readUserData();
  return data.background || null;
};

export const saveBackground = async (bg) => {
  const data = await readUserData();
  data.background = bg;
  await writeUserData(data);
  const verify = await readUserData();
  console.log("✅ Đã lưu, kiểm tra lại messages:", verify.messages);
};

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
