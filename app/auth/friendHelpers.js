import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/app/api/api";

/**
 * Lấy danh sách bạn bè từ server, lưu vào state và AsyncStorage.
 * @param {Function} setFriends - Hàm setState friends.
 * @param {Function} setFriendsLoading - Hàm setState loading.
 * @param {Function} setFriendsError - Hàm setState error.
 * @returns {Promise<Array>}
 */
export const fetchFriends = async (
  setFriends,
  setFriendsLoading,
  setFriendsError
) => {
  try {
    setFriendsLoading(true);
    setFriendsError(null);
    const response = await api.getFriends();
    setFriends(response || []);
    await AsyncStorage.setItem("friends", JSON.stringify(response));
    return response;
  } catch (error) {
    setFriendsError("Không thể tải danh sách bạn bè.");
    try {
      const cachedFriends = await AsyncStorage.getItem("friends");
      if (cachedFriends) {
        setFriends(JSON.parse(cachedFriends));
      }
    } catch (storageError) {
      // ignore
    }
    return [];
  } finally {
    setFriendsLoading(false);
  }
};

/**
 * Cập nhật danh sách bạn bè khi thêm hoặc xóa bạn.
 * @param {Function} setFriends - Hàm setState friends.
 * @param {Function} fetchFriends - Hàm fetch lại danh sách bạn bè.
 * @param {Object|null} newFriend - Thông tin bạn mới (nếu có).
 * @param {string|null} removedFriendId - ID bạn bị xóa (nếu có).
 */
export const updateFriendsList = async (
  setFriends,
  fetchFriends,
  newFriend = null,
  removedFriendId = null
) => {
  try {
    if (newFriend) {
      setFriends((prev) => {
        const updatedFriends = [...prev, newFriend];
        AsyncStorage.setItem("friends", JSON.stringify(updatedFriends));
        return updatedFriends;
      });
    } else if (removedFriendId) {
      setFriends((prev) => {
        const updatedFriends = prev.filter(
          (friend) => friend._id !== removedFriendId
        );
        AsyncStorage.setItem("friends", JSON.stringify(updatedFriends));
        return updatedFriends;
      });
    } else {
      await fetchFriends();
    }
  } catch (error) {
    // ignore
  }
};

/**
 * Lấy danh sách lời mời kết bạn đã gửi.
 * @param {Function} setSentFriendRequests
 * @param {Function} setFriendRequestsLoading
 * @param {Function} setFriendRequestsError
 */
export const fetchSentFriendRequests = async (
  setSentFriendRequests,
  setFriendRequestsLoading,
  setFriendRequestsError
) => {
  setFriendRequestsLoading(true);
  setFriendRequestsError(null);
  try {
    const data = await api.getFriendRequestsSent();
    setSentFriendRequests(data || []);
  } catch (err) {
    setFriendRequestsError("Không thể tải danh sách lời mời đã gửi.");
    setSentFriendRequests([]);
  } finally {
    setFriendRequestsLoading(false);
  }
};

/**
 * Lấy danh sách lời mời kết bạn đã nhận.
 * @param {Function} setReceivedFriendRequests
 * @param {Function} setFriendRequestsLoading
 * @param {Function} setFriendRequestsError
 */
export const fetchReceivedFriendRequests = async (
  setReceivedFriendRequests,
  setFriendRequestsLoading,
  setFriendRequestsError
) => {
  setFriendRequestsLoading(true);
  setFriendRequestsError(null);
  try {
    const data = await api.getFriendRequestsReceived();
    setReceivedFriendRequests(data || []);
  } catch (err) {
    setFriendRequestsError("Không thể tải danh sách lời mời đã nhận.");
    setReceivedFriendRequests([]);
  } finally {
    setFriendRequestsLoading(false);
  }
};

/**
 * Hàm tổng hợp để fetch cả 3 loại danh sách bạn bè và lời mời.
 * @param {Function} fetchFriends
 * @param {Function} fetchSentFriendRequests
 * @param {Function} fetchReceivedFriendRequests
 */
export const fetchAllFriendData = async (
  fetchFriends,
  fetchSentFriendRequests,
  fetchReceivedFriendRequests
) => {
  await Promise.all([
    fetchFriends(),
    fetchSentFriendRequests(),
    fetchReceivedFriendRequests(),
  ]);
};
