import { useContext, useCallback } from "react";
import { AuthContext } from "@/app/auth/AuthContext";

/**
 * Custom hook: trả về hàm navigateToProfile sử dụng context đúng chuẩn hook
 */
export function useNavigateToProfile() {
  const {
    friends,
    sentFriendRequests,
    receivedFriendRequests,
  } = useContext(AuthContext);

  /**
   * Navigates to a user profile with automatic friendship status detection
   * @param {Object} navigation - The navigation object
   * @param {Object} user - The user object to navigate to
   * @param {Object} options - Additional options (optional)
   * @param {boolean} options.showLoading - Whether to show loading indicator
   * @param {Function} options.onLoadingChange - Callback for loading state changes
   */
  return useCallback(
    (navigation, user, options = {}) => {
      if (!user || !user.userId) {
        console.warn("Invalid user object provided to navigateToProfile");
        return;
      }

      const { showLoading = false, onLoadingChange = null } = options;

      try {
        if (showLoading && onLoadingChange) onLoadingChange(true);

        let requestSent = "";

        // Kiểm tra trạng thái bạn bè/lời mời
        if (friends.some(friend => friend.userId === user.userId)) {
          requestSent = "friend";
        } else if (
          sentFriendRequests.some(
            request =>
              (request.receiver?.userId || request.receiverId?.userId) === user.userId
          )
        ) {
          requestSent = "pending";
        } else if (
          receivedFriendRequests.some(
            request =>
              (request.sender?.userId || request.senderId?.userId) === user.userId
          )
        ) {
          requestSent = "accepted";
        }

        navigation.navigate("UserProfile", {
          friend: user,
          requestSent,
        });
      } catch (error) {
        console.error("Error navigating to profile:", error);
        navigation.navigate("UserProfile", {
          friend: user,
          requestSent: "",
        });
      } finally {
        if (showLoading && onLoadingChange) onLoadingChange(false);
      }
    },
    [friends, sentFriendRequests, receivedFriendRequests]
  );
}
