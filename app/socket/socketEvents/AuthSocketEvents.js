import { api } from "@/app/api/api";
import { fetchName } from "@/app/components/getUserInfo/UserName";

export const setupAuthSocketEvents = (
  socket,
  userInfo,
  setConversations,
  saveMessages,
  addConversation,
  setUnreadConversation,
  isMessageScreenActive = false
) => {
  if (!socket) return () => {};

  console.log("🟢 Đã thiết lập các sự kiện socket cho AuthSocketEvents");
  const handleNewMessage = async ({
    conversationId: incomingConversationId,
    message,
  }) => {
    console.log("🟢 Nhận tin nhắn mới:", message);

    try {
      const response = await api.getAllMessages(incomingConversationId);
      if (response && response.messages) {
        const filteredMessages = response.messages.filter(
          (m) => !m.hiddenFrom?.includes(userInfo?.userId)
        );
        // console.log(
        //   "Đã tải tin nhắn từ API khi nhận tin nhắn mới:",
        //   filteredMessages.map((msg) => msg.content)
        // );

        // Lưu tin nhắn vào AsyncStorage và cập nhật conversations
        await saveMessages(
          incomingConversationId,
          filteredMessages,
          "before",
          (updatedMessages) => {
            setConversations((prevConversations) => {
              const updated = prevConversations.map((conv) => {
                if (conv.conversationId !== incomingConversationId) return conv;

                // Cập nhật unreadCount cho user hiện tại nếu không phải là người gửi
                let newUnreadCount = Array.isArray(conv.unreadCount)
                  ? [...conv.unreadCount]
                  : [];
                if (message.senderId !== userInfo?.userId && userInfo?.userId) {
                  const idx = newUnreadCount.findIndex(
                    (u) => u.userId === userInfo.userId
                  );
                  if (idx !== -1) {
                    // Tăng số lượng chưa đọc
                    newUnreadCount[idx] = {
                      ...newUnreadCount[idx],
                      count: (newUnreadCount[idx].count || 0) + 1,
                      lastReadMessageId: newUnreadCount[idx].lastReadMessageId,
                    };
                  } else {
                    // Thêm mới nếu chưa có
                    newUnreadCount.push({
                      userId: userInfo.userId,
                      count: 1,
                      lastReadMessageId: null,
                    });
                  }
                }

                return {
                  ...conv,
                  lastMessage: updatedMessages[0] || conv.lastMessage,
                  messages: updatedMessages,
                  unreadCount: newUnreadCount,
                };
              });
              // Cập nhật tổng số cuộc trò chuyện chưa đọc
              if (setUnreadConversation && userInfo?.userId) {
                const unread = updated.filter(
                  (conv) =>
                    Array.isArray(conv.unreadCount) &&
                    conv.unreadCount.some(
                      (u) => u.userId === userInfo.userId && u.count > 0
                    )
                ).length;
                setUnreadConversation(unread);
              }
              return updated;
            });
            // console.log(
            //   "Đã cập nhật conversations với tin nhắn mới từ API:",
            //   updatedMessages.map((msg) => msg.content)
            // );
          }
        );
      }
    } catch (error) {
      console.error(
        "Lỗi khi tải tin nhắn từ API trong handleNewMessage:",
        error
      );
    }
  };

  const handleNewConversation = ({ conversation }) => {
    console.log("🟢 Nhận cuộc trò chuyện mới:", conversation);
    addConversation({ ...conversation, messages: [] });
  };

  const handleAvatarChange = ({ conversationId, newAvatar }) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.conversationId === conversationId
          ? {
              ...conv,
              groupAvatarUrl: newAvatar,
              unreadCount: [],
              lastMessage: {
                ...conv.lastMessage,
                content: "Ảnh nhóm đã thay đổi",
                senderId: null,
                createdAt: new Date().toISOString(),
              },
            }
          : conv
      )
    );
    console.log(`Đã cập nhật avatar cho cuộc trò chuyện ${conversationId}.`);
  };

  const handleNewGroupName = ({ conversationId, newName }) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.conversationId === conversationId
          ? {
              ...conv,
              groupName: newName,
              unreadCount: [],
              lastMessage: {
                ...conv.lastMessage,
                content: "Tên nhóm đã thay đổi",
                senderId: null,
                createdAt: new Date().toISOString(),
              },
            }
          : conv
      )
    );
    console.log("Đã đổi tên nhóm");
  };

  const handleNewMemberJoined = async ({ conversationId, userId }) => {
    const userName = await fetchName(userId);
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.conversationId === conversationId
          ? {
              ...conv,
              unreadCount: [],
              groupMembers: [...conv.groupMembers, userId],
              lastMessage: {
                ...conv.lastMessage,
                content: `${userName} vừa vào nhóm`,
                senderId: null,
                createdAt: new Date().toISOString(),
              },
            }
          : conv
      )
    );
    console.log(`User ${userName} đã vào nhóm ${conversationId}`);
  };

  const handleUserAdded = async ({
    conversationId,
    addedUser,
    addedByUser,
  }) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.conversationId === conversationId
          ? {
              ...conv,
              unreadCount: [],
              groupMembers: [...conv.groupMembers, addedUser.userId],
              lastMessage: {
                ...conv.lastMessage,
                content: `${addedByUser.fullname} đã thêm ${addedUser.fullname} vào nhóm`,
                senderId: null,
                createdAt: new Date().toISOString(),
              },
            }
          : conv
      )
    );
    console.log(
      `User ${addedUser.fullname} đã được thêm vào nhóm ${conversationId}`
    );
  };

  const handleMemberLeft = async ({ conversationId, userId }) => {
    const userName = await fetchName(userId);
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.conversationId === conversationId
          ? {
              ...conv,
              unreadCount: [],
              groupMembers: conv.groupMembers.filter((id) => id !== userId),
              lastMessage: {
                ...conv.lastMessage,
                content: `${userName} đã rời nhóm`,
                senderId: null,
                createdAt: new Date().toISOString(),
              },
            }
          : conv
      )
    );
    console.log(`User ${userName} đã rời nhóm ${conversationId}`);
  };

  const handleMemberRemoved = async ({
    conversationId,
    kickedUser,
    kickedByUser,
  }) => {
    if (kickedUser.userId === userInfo?.userId) {
      console.log("Bạn đã bị xóa khỏi nhóm. Xóa cuộc trò chuyện...");
      setConversations((prevConversations) =>
        prevConversations.filter(
          (conv) => conv.conversationId !== conversationId
        )
      );
    } else {
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.conversationId === conversationId
            ? {
                ...conv,
                unreadCount: [],
                groupMembers: conv.groupMembers.filter(
                  (id) => id !== kickedUser.userId
                ),
                lastMessage: {
                  ...conv.lastMessage,
                  content: `${kickedUser.fullname} đã bị ${kickedByUser.fullname} xóa khỏi nhóm`,
                  senderId: null,
                  createdAt: new Date().toISOString(),
                },
              }
            : conv
        )
      );
    }
  };

  const handleUserBlocked = async ({ conversationId, blockedUserId }) => {
    if (blockedUserId === userInfo?.userId) {
      console.log("Bạn đã bị chặn khỏi nhóm. Xóa cuộc trò chuyện...");
      setConversations((prevConversations) =>
        prevConversations.filter(
          (conv) => conv.conversationId !== conversationId
        )
      );
    } else {
      const userName = await fetchName(blockedUserId);
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.conversationId === conversationId
            ? {
                ...conv,
                blocked: [...conv.blocked, blockedUserId],
                lastMessage: {
                  ...conv.lastMessage,
                  content: `${userName} đã bị chặn khỏi nhóm`,
                  senderId: null,
                  createdAt: new Date().toISOString(),
                },
              }
            : conv
        )
      );
    }
  };

  const handleOwnerChange = async ({ conversationId, newOwner }) => {
    const userName = await fetchName(newOwner);
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.conversationId === conversationId
          ? {
              ...conv,
              unreadCount: [],
              rules: {
                ...conv.rules,
                ownerId: newOwner,
              },
              lastMessage: {
                ...conv.lastMessage,
                content: `${userName} đang là nhóm trưởng`,
                senderId: null,
                createdAt: new Date().toISOString(),
              },
            }
          : conv
      )
    );
    console.log(
      `Nhóm trưởng đã được truyền lại cho user ${newOwner} trong nhóm ${conversationId}`
    );
  };

  const handleAddCoOwner = async ({ conversationId, newCoOwnerIds }) => {
    const userName = await fetchName(newCoOwnerIds);
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.conversationId === conversationId
          ? {
              ...conv,
              unreadCount: [],
              rules: {
                ...conv.rules,
                coOwnerIds: [...conv.rules.coOwnerIds, ...newCoOwnerIds],
              },
              lastMessage: {
                ...conv.lastMessage,
                content: `${userName} đã làm nhóm phó`,
                senderId: null,
                createdAt: new Date().toISOString(),
              },
            }
          : conv
      )
    );
    console.log(
      `Nhóm phó đã được thêm: ${newCoOwnerIds.join(
        ", "
      )} trong nhóm ${conversationId}`
    );
  };

  const handleRemoveCoOwner = async ({ conversationId, removedCoOwner }) => {
    const userName = await fetchName(removedCoOwner);
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.conversationId === conversationId
          ? {
              ...conv,
              unreadCount: [],
              rules: {
                ...conv.rules,
                coOwnerIds: conv.rules.coOwnerIds.filter(
                  (id) => !removedCoOwner.includes(id)
                ),
              },
              lastMessage: {
                ...conv.lastMessage,
                content: `${userName} đã không còn là nhóm phó`,
                senderId: null,
                createdAt: new Date().toISOString(),
              },
            }
          : conv
      )
    );
    console.log(
      `Nhóm phó đã bị loại bỏ: ${removedCoOwner.join(
        ", "
      )} trong nhóm ${conversationId}`
    );
  };

  const handleGroupDeleted = ({ conversationId }) => {
    setConversations((prevConversations) =>
      prevConversations.filter((conv) => conv.conversationId !== conversationId)
    );
    console.log(`Nhóm ${conversationId} đã bị xóa`);
  };

  const handleUserUnblocked = async ({ conversationId, unblockedUserId }) => {
    const userName = await fetchName(unblockedUserId);
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.conversationId === conversationId
          ? {
              ...conv,
              blocked: conv.blocked.filter((id) => id !== unblockedUserId),
              lastMessage: {
                ...conv.lastMessage,
                content: `${userName} đã được gỡ chặn khỏi nhóm`,
                senderId: null,
                createdAt: new Date().toISOString(),
              },
            }
          : conv
      )
    );
    console.log(
      `User ${userName} đã được bỏ chặn trong nhóm ${conversationId}`
    );
  };

  if (!isMessageScreenActive) {

  // Cleanup tất cả event trước khi đăng ký mới
  socket.off("newMessage");
  socket.off("newConversation");
  socket.off("groupAvatarChanged");
  socket.off("groupNameChanged");
  socket.off("userJoinedGroup");
  socket.off("userAddedToGroup");
  socket.off("userLeftGroup");
  socket.off("userRemovedFromGroup");
  socket.off("groupOwnerChanged");
  socket.off("groupCoOwnerAdded");
  socket.off("groupCoOwnerRemoved");
  socket.off("groupDeleted");
  socket.off("userBlocked");
  socket.off("userUnblocked");

  // Đăng ký các sự kiện socket
    socket.on("newMessage", handleNewMessage);
    socket.on("newConversation", handleNewConversation);
    socket.on("groupAvatarChanged", handleAvatarChange);
    socket.on("groupNameChanged", handleNewGroupName);
    socket.on("userJoinedGroup", handleNewMemberJoined);
    socket.on("userAddedToGroup", handleUserAdded);
    socket.on("userLeftGroup", handleMemberLeft);
    socket.on("userRemovedFromGroup", handleMemberRemoved);
    socket.on("groupOwnerChanged", handleOwnerChange);
    socket.on("groupCoOwnerAdded", handleAddCoOwner);
    socket.on("groupCoOwnerRemoved", handleRemoveCoOwner);
    socket.on("groupDeleted", handleGroupDeleted);
    socket.on("userBlocked", handleUserBlocked);
    socket.on("userUnblocked", handleUserUnblocked);
  }

  // Hàm cleanup
  return () => {
    socket.off("newMessage", handleNewMessage);
    socket.off("newConversation", handleNewConversation);
    socket.off("groupAvatarChanged", handleAvatarChange);
    socket.off("groupNameChanged", handleNewGroupName);
    socket.off("userJoinedGroup", handleNewMemberJoined);
    socket.off("userAddedToGroup", handleUserAdded);
    socket.off("userLeftGroup", handleMemberLeft);
    socket.off("userRemovedFromGroup", handleMemberRemoved);
    socket.off("groupOwnerChanged", handleOwnerChange);
    socket.off("groupCoOwnerAdded", handleAddCoOwner);
    socket.off("groupCoOwnerRemoved", handleRemoveCoOwner);
    socket.off("groupDeleted", handleGroupDeleted);
    socket.off("userBlocked", handleUserBlocked);
    socket.off("userUnblocked", handleUserUnblocked);
  };
};
