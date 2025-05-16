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

        // Kiểm tra cấu trúc dữ liệu
        if (!data || typeof data !== "object") {
          throw new Error("Dữ liệu không hợp lệ: phải là một object");
        }
        if (!data.messages) {
          data.messages = {};
        }
        if (!data.conversations) {
          data.conversations = [];
        }

        // Làm sạch dữ liệu
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
          JSON.parse(content); // Xác thực JSON hợp lệ
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

        // Sao lưu file hiện tại nếu tồn tại
        let fileUri;
        if (existingFileUri) {
          fileUri = existingFileUri;
          try {
            const backupDir = `${dirUri}/backup`;
            await FileSystem.makeDirectoryAsync(backupDir, {
              intermediates: true,
            });
            const backupFile = `${backupDir}/${cleanFileName}.${Date.now()}.bak`;
            await FileSystem.copyAsync({ from: fileUri, to: backupFile });
            console.log("✅ Đã sao lưu file:", backupFile);
          } catch (backupErr) {
            console.warn("⚠️ Không thể sao lưu file:", backupErr);
          }
        } else {
          fileUri = await StorageAccessFramework.createFileAsync(
            dirUri,
            cleanFileName.replace(".json", ""),
            "application/json"
          );
          console.log("✅ Tạo tệp mới:", fileUri);
        }

        // Ghi file
        await FileSystem.writeAsStringAsync(fileUri, content, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        // Xóa các file trùng lặp
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

        console.log("✅ Đã ghi dữ liệu vào:", fileUri);
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
      return { messages: {}, conversations: [] }; // Trả về dữ liệu mặc định
    }

    const content = await FileSystem.readAsStringAsync(target, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    // console.log("📄 Nội dung tệp:", content);
    if (!content) return { messages: {}, conversations: [] };

    try {
      const parsedContent = JSON.parse(content);
      // Kiểm tra cấu trúc dữ liệu
      if (!parsedContent.messages) {
        parsedContent.messages = {};
      }
      if (!parsedContent.conversations) {
        parsedContent.conversations = [];
      }
      return parsedContent;
    } catch (err) {
      console.error("❌ Lỗi khi parse JSON:", err);
      console.log("🔍 Nội dung file gây lỗi:", content);

      // Sao lưu file lỗi
      try {
        const backupDir = `${dirUri}/backup`;
        await FileSystem.makeDirectoryAsync(backupDir, { intermediates: true });
        const backupFile = `${backupDir}/${cleanFileName}.${Date.now()}.error.bak`;
        await FileSystem.copyAsync({ from: target, to: backupFile });
        console.log("✅ Đã sao lưu file lỗi:", backupFile);
      } catch (backupErr) {
        console.warn("⚠️ Không thể sao lưu file lỗi:", backupErr);
      }

      // Thử sửa JSON
      try {
        // Loại bỏ các ký tự không hợp lệ và thử parse lại
        const cleanedContent = content
          .replace(/[\u0000-\u001F]+/g, "") // Loại bỏ ký tự điều khiển
          .replace(/,\s*}/g, "}") // Sửa dấu phẩy thừa
          .replace(/,\s*]/g, "]"); // Sửa dấu phẩy thừa
        const parsedPartial = JSON.parse(cleanedContent);
        if (!parsedPartial.messages) {
          parsedPartial.messages = {};
        }
        if (!parsedPartial.conversations) {
          parsedPartial.conversations = [];
        }
        console.log("✅ Đã sửa và parse JSON:", parsedPartial);
        return parsedPartial;
      } catch (partialErr) {
        console.error("❌ Không thể sửa JSON:", partialErr);
        return { messages: {}, conversations: [] }; // Trả về dữ liệu mặc định
      }
    }
  } catch (err) {
    console.error("❌ Lỗi đọc tệp:", err);
    await handleStorageError(err);
    return { messages: {}, conversations: [] };
  }
};

export const debugFileContent = async (fileName) => {
  try {
    const dirUri = await getBaseDir();
    const files = await StorageAccessFramework.readDirectoryAsync(dirUri);
    const cleanFileName = fileName.replace(/ \(\d+\)\.json$/, ".json");
    const target = files.find((f) => {
      const decodedUri = decodeURIComponent(f);
      return (
        decodedUri.endsWith(`/${cleanFileName}`) ||
        decodedUri.match(
          new RegExp(
            `/${cleanFileName.replace(".json", "")}\\s*\\(\\d+\\)\\.json$`
          )
        )
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
  // Đảm bảo trả về đúng cấu trúc object
  return {
    nonPinned: data.conversations || [],
    pinned: data.pinnedConversations || [],
  };
};

export const saveConversations = async ({ nonPinned = [], pinned = [] }) => {
  const data = await readUserData();
  const MAX_CONVERSATIONS = 100;
  data.conversations = nonPinned.slice(0, MAX_CONVERSATIONS);
  data.pinnedConversations = pinned.slice(0, MAX_CONVERSATIONS);
  await writeUserData(data);
  return {
    nonPinned: data.conversations,
    pinned: data.pinnedConversations,
  };
};

export const getMessages = async (conversationId) => {
  const data = await readUserData();
  // console.log("📂 Dữ liệu từ readUserData:", JSON.stringify(data));
  if (!data || !data.messages) {
    console.warn("⚠️ Không có dữ liệu messages trong readUserData:", data);
    return [];
  }

  const messages = data.messages?.[conversationId] || [];
  // console.log("📩 Tin nhắn từ readUserData:", messages);
  if (Array.isArray(messages) && messages.length > 0) {
    return messages.map((msg) => ({
      ...msg,
      replyData: msg.replyData || null,
    }));
  }

  // Nếu không có tin nhắn, thử lấy từ conversation
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
  if (!conversationId || !Array.isArray(newMessages)) {
    console.error("❌ conversationId hoặc newMessages không hợp lệ");
    return [];
  }

  // Kiểm tra tính hợp lệ của newMessages
  const validMessages = newMessages.filter((msg) => {
    if (!msg || !msg.messageDetailId || !msg.content || !msg.createdAt) {
      console.warn("⚠️ Tin nhắn không hợp lệ:", msg);
      return false;
    }
    return true;
  });

  if (validMessages.length === 0) {
    console.warn("⚠️ Không có tin nhắn hợp lệ để lưu");
    return [];
  }

  const data = await readUserData();
  const oldMessages = data.messages?.[conversationId] || [];

  // Gộp tin nhắn
  const merged =
    direction === "before"
      ? [...validMessages, ...oldMessages]
      : [...oldMessages, ...validMessages];
  const deduped = Array.from(
    new Map(
      merged
        .filter((m) => m && m.messageDetailId)
        .map((m) => [m.messageDetailId, m])
    ).values()
  );

  // Giới hạn số lượng tin nhắn
  const MAX_MESSAGES = 1000;
  const limited = deduped
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-MAX_MESSAGES);

  // Cập nhật dữ liệu
  if (!data.messages) data.messages = {};
  data.messages[conversationId] = limited;

  // Ghi dữ liệu
  try {
    await writeUserData(data);
    console.log("✅ Đã lưu tin nhắn cho conversation:", conversationId);
    return limited;
  } catch (err) {
    console.error("❌ Lỗi khi lưu tin nhắn:", err);
    return [];
  }
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
};

export const getBackground = async () => {
  const data = await readUserData();
  return data.background || null;
};

export const saveBackground = async (bg) => {
  const data = await readUserData();
  data.background = bg;
  await writeUserData(data);
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
