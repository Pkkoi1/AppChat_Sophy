import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/app/api/api";
import { Alert } from "react-native";

/**
 * So sánh tin nhắn cuối cùng giữa local và server để kiểm tra đồng bộ.
 * @param {Array} conversations - Danh sách cuộc trò chuyện hiện tại.
 * @param {Object} userInfo - Thông tin người dùng hiện tại.
 * @param {string} conversationId - ID cuộc trò chuyện cần kiểm tra.
 * @returns {Promise<{isDifferent: boolean, details: string}>}
 */
export const checkLastMessageDifference = async (
  conversations,
  userInfo,
  conversationId
) => {
  try {
    const localConversation = conversations.find(
      (conv) => conv.conversationId === conversationId
    );
    const localLastMessage = localConversation?.lastMessage || null;

    const response = await api.getAllMessages(conversationId);
    if (!response || !response.messages) {
      throw new Error("API không trả về dữ liệu tin nhắn hợp lệ.");
    }

    const serverMessages = response.messages.filter(
      (m) => !m.hiddenFrom?.includes(userInfo?.userId)
    );
    const serverLastMessage = serverMessages[0] || null;

    if (!localLastMessage && !serverLastMessage) {
      return {
        isDifferent: false,
        details: "Không có tin nhắn ở cả hai bên",
      };
    }

    if (!localLastMessage || !serverLastMessage) {
      return {
        isDifferent: true,
        details: `Cục bộ: ${
          localLastMessage ? "Có tin nhắn" : "Không có"
        }, Server: ${serverLastMessage ? "Có tin nhắn" : "Không có"}`,
      };
    }

    const isDifferent =
      localLastMessage.messageDetailId !== serverLastMessage.messageDetailId ||
      localLastMessage.content !== serverLastMessage.content ||
      localLastMessage.createdAt !== serverLastMessage.createdAt;

    return {
      isDifferent,
      details: isDifferent
        ? `Cục bộ: ${localLastMessage.messageDetailId}, Server: ${serverLastMessage.messageDetailId}`
        : "Tin nhắn khớp",
    };
  } catch (error) {
    return {
      isDifferent: true,
      details: `Lỗi: ${error.message}`,
    };
  }
};

/**
 * Thêm một cuộc trò chuyện mới vào danh sách và lưu vào AsyncStorage.
 * @param {Function} setConversations - Hàm setState cho conversations.
 * @param {Object} conversationData - Dữ liệu cuộc trò chuyện mới.
 * @returns {Promise<Object>}
 */
export const addConversation = async (setConversations, conversationData) => {
  try {
    if (!conversationData.conversationId) {
      throw new Error("Thiếu conversationId.");
    }
    setConversations((prev) => {
      const updatedConversations = Array.from(
        new Map(
          [{ ...conversationData, messages: [] }, ...prev].map((conv) => [
            conv.conversationId,
            conv,
          ])
        ).values()
      ).sort((a, b) => {
        const timeA = a.lastMessage?.createdAt
          ? new Date(a.lastMessage.createdAt)
          : new Date(0);
        const timeB = b.lastMessage?.createdAt
          ? new Date(b.lastMessage.createdAt)
          : new Date(0);
        return timeB - timeA;
      });
      AsyncStorage.setItem(
        "conversations",
        JSON.stringify(updatedConversations)
      );
      return updatedConversations;
    });
    return conversationData;
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa một cuộc trò chuyện khỏi danh sách và server, kiểm tra đồng bộ trước khi xóa.
 * @param {Object} params - Tham số truyền vào.
 * @param {Array} params.conversations - Danh sách conversations hiện tại.
 * @param {Object} params.userInfo - Thông tin user.
 * @param {Function} params.setConversations - Hàm setState conversations.
 * @param {Function} params.handlerRefresh - Hàm làm mới danh sách.
 * @param {Object} params.socket - Socket instance.
 * @param {string} conversationId - ID cuộc trò chuyện cần xóa.
 * @returns {Promise<any>}
 */
export const removeConversation = async (
  { conversations, userInfo, setConversations, handlerRefresh, socket },
  conversationId
) => {
  try {
    const { isDifferent } = await checkLastMessageDifference(
      conversations,
      userInfo,
      conversationId
    );
    if (isDifferent) {
      await handlerRefresh();
    }

    setConversations((prev) => {
      const updatedConversations = prev.filter(
        (conv) => conv.conversationId !== conversationId
      );
      AsyncStorage.setItem(
        "conversations",
        JSON.stringify(updatedConversations)
      );
      return updatedConversations;
    });

    const response = await api.deleteConversation(conversationId);

    if (socket && socket.connected) {
      socket.emit("conversationRemoved", {
        conversationId,
        userId: userInfo?.userId,
      });
    }

    return response;
  } catch (error) {
    Alert.alert(
      "Lỗi",
      `Không thể xóa cuộc trò chuyện: ${
        error.response?.data?.message || error.message
      }`
    );
    throw error;
  }
};
