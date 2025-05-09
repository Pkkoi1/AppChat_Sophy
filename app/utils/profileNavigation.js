import { api } from "../api/api";

/**
 * Navigates to a user profile with automatic friendship status detection
 * @param {Object} navigation - The navigation object
 * @param {Object} user - The user object to navigate to
 * @param {Object} options - Additional options (optional)
 * @param {boolean} options.showLoading - Whether to show loading indicator
 * @param {Function} options.onLoadingChange - Callback for loading state changes
 */
export const navigateToProfile = async (navigation, user, options = {}) => {
  if (!user || !user.userId) {
    console.warn("Invalid user object provided to navigateToProfile");
    return;
  }

  const { showLoading = false, onLoadingChange = null } = options;

  try {
    // Set loading state if needed
    if (showLoading && onLoadingChange) {
      onLoadingChange(true);
    }

    // Determine user relationship status
    let requestSent = "";

    // Check if user is a friend
    const friends = await api.getFriends();
    if (friends.some(friend => friend.userId === user.userId)) {
      requestSent = "friend";
    } else {
      // Check sent requests
      const sentRequests = await api.getFriendRequestsSent();
      if (sentRequests.some(request => request.receiverId?.userId === user.userId)) {
        requestSent = "pending";
      } else {
        // Check received requests
        const receivedRequests = await api.getFriendRequestsReceived();
        if (receivedRequests.some(request => request.senderId?.userId === user.userId)) {
          requestSent = "accepted";
        }
      }
    }

    // Navigate to profile with determined status
    navigation.navigate("UserProfile", {
      friend: user,
      requestSent
    });

  } catch (error) {
    console.error("Error navigating to profile:", error);
    
    // If error occurs, still navigate but with empty status
    navigation.navigate("UserProfile", {
      friend: user,
      requestSent: ""
    });
  } finally {
    // Reset loading state if needed
    if (showLoading && onLoadingChange) {
      onLoadingChange(false);
    }
  }
};
