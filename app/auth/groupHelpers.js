import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/app/api/api";

/**
 * Thêm thành viên mới vào nhóm.
 * @param {Function} setConversations - Hàm setState conversations.
 * @param {Function} setGroupMember - Hàm setState groupMember.
 * @param {string} conversationId - ID nhóm.
 * @param {Array} newMembers - Danh sách thành viên mới.
 */
export const updateGroupMembers = async (
  setConversations,
  setGroupMember,
  conversationId,
  newMembers
) => {
  try {
    if (!conversationId || !Array.isArray(newMembers)) {
      throw new Error(
        "Thiếu conversationId hoặc danh sách thành viên không hợp lệ."
      );
    }

    const updateList = (list) =>
      list.map((conv) =>
        conv.conversationId === conversationId
          ? { ...conv, groupMembers: [...conv.groupMembers, ...newMembers] }
          : conv
      );

    setConversations((prev) => {
      const updated = updateList(prev);
      AsyncStorage.setItem("conversations", JSON.stringify(updated));
      return updated;
    });

    setGroupMember((prevMembers) => [
      ...prevMembers,
      ...newMembers.filter(
        (newMember) => !prevMembers.some((member) => member.id === newMember.id)
      ),
    ]);
  } catch (error) {
    throw error;
  }
};

/**
 * Đổi vai trò thành viên trong nhóm.
 * @param {Function} setGroupMember - Hàm setState groupMember.
 * @param {string} conversationId - ID nhóm.
 * @param {string} memberId - ID thành viên.
 * @param {string} newRole - Vai trò mới.
 */
export const changeRole = async (
  setGroupMember,
  conversationId,
  memberId,
  newRole
) => {
  try {
    if (!conversationId || !memberId || !newRole) {
      throw new Error("Thiếu conversationId, memberId hoặc role.");
    }
    setGroupMember((prevMembers) =>
      prevMembers.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa thành viên khỏi nhóm.
 * @param {Function} setConversations - Hàm setState conversations.
 * @param {Function} setGroupMember - Hàm setState groupMember.
 * @param {string} conversationId - ID nhóm.
 * @param {string} memberId - ID thành viên cần xóa.
 */
export const removeGroupMember = async (
  setConversations,
  setGroupMember,
  conversationId,
  memberId
) => {
  try {
    if (!conversationId || !memberId) {
      throw new Error("Thiếu conversationId hoặc memberId.");
    }

    const updateList = (list) =>
      list.map((conv) =>
        conv.conversationId === conversationId
          ? {
              ...conv,
              groupMembers: conv.groupMembers.filter((id) => id !== memberId),
            }
          : conv
      );

    setConversations((prev) => {
      const updated = updateList(prev);
      AsyncStorage.setItem("conversations", JSON.stringify(updated));
      return updated;
    });

    setGroupMember((prevMembers) =>
      prevMembers.filter((member) => member.id !== memberId)
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Lưu danh sách thành viên nhóm.
 * @param {Function} setGroupMember - Hàm setState groupMember.
 * @param {string} conversationId - ID nhóm.
 * @param {Array} members - Danh sách thành viên.
 */
export const saveGroupMembers = async (
  setGroupMember,
  conversationId,
  members
) => {
  try {
    if (!conversationId || !Array.isArray(members)) {
      throw new Error(
        "Thiếu conversationId hoặc danh sách thành viên không hợp lệ."
      );
    }
    setGroupMember(members);
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách nhóm từ server, lưu vào state và AsyncStorage.
 * @param {Function} setGroups - Hàm setState groups.
 * @param {Function} setGroupsLoading - Hàm setState loading.
 * @returns {Promise<Array>}
 */
export const fetchGroups = async (setGroups, setGroupsLoading) => {
  try {
    setGroupsLoading(true);
    const response = await api.getGroups();

    if (response) {
      const sortedGroups = response.sort((a, b) => {
        const dateA = a.lastMessage?.createdAt
          ? new Date(a.lastMessage.createdAt)
          : new Date(0);
        const dateB = b.lastMessage?.createdAt
          ? new Date(b.lastMessage.createdAt)
          : new Date(0);
        return dateB - dateA;
      });

      setGroups(sortedGroups);
      await AsyncStorage.setItem("groups", JSON.stringify(sortedGroups));
    }

    return response;
  } catch (error) {
    console.error("Error fetching groups:", error);
    try {
      const cachedGroups = await AsyncStorage.getItem("groups");
      if (cachedGroups) {
        setGroups(JSON.parse(cachedGroups));
      }
    } catch (storageError) {
      console.error("Error loading cached groups:", storageError);
    }

    return [];
  } finally {
    setGroupsLoading(false);
  }
};
