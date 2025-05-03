import { api } from "@/app/api/api";
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
import { Alert } from "react-native";

export const setupMessageSocketEvents = (
  socket,
  conversation,
  userInfo,
  setMessages,
  saveGroupMembers,
  groupMember,
  changeRole,
  handlerRefresh,
  navigation
) => {
  if (!socket || !conversation?.conversationId) return () => {};

  socket.emit("joinUserConversations", [conversation.conversationId]);

  const handleNewMessage = async ({ conversationId, message, sender }) => {
    if (conversationId === conversation.conversationId) {
      console.log(
        "Đã nhận tin nhắn mới trong cuộc trò chuyện:",
        conversationId,
        message.content
      );

      // Đánh dấu tin nhắn đã đọc
      api.readMessage(conversationId);
      if (message?.senderId !== userInfo?.userId) {
        // Chỉ thêm tin nhắn vào trạng thái messages
        setMessages((prevMessages) => [message, ...prevMessages]);
      }
    }
  };

  const handleNewConversation = async () => {
    console.log("New conversation received. Refreshing conversations...");
    await handlerRefresh();
  };

  const handleMessageRecalled = ({ conversationId, messageId }) => {
    if (conversationId === conversation.conversationId) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageDetailId === messageId ? { ...msg, isRecall: true } : msg
        )
      );
      console.log(
        "Nhận tin nhắn đã thu hồi qua socket:",
        conversationId,
        messageId
      );
    }
  };

  const handleMessagePinned = ({ conversationId, messageId }) => {
    if (conversationId === conversation.conversationId) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageDetailId === messageId
            ? { ...msg, isPinned: true, pinnedAt: new Date() }
            : msg
        )
      );
      console.log(
        "Nhận tin nhắn đã ghim qua socket:",
        conversationId,
        messageId
      );
    }
  };

  const handleMessageUnpinned = ({ conversationId, messageId }) => {
    if (conversationId === conversation.conversationId) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageDetailId === messageId
            ? { ...msg, isPinned: false, pinnedAt: null }
            : msg
        )
      );
      console.log(
        "Nhận tin nhắn đã bỏ ghim qua socket:",
        conversationId,
        messageId
      );
    }
  };

  const handleGroupAvatarChanged = (data) => {
    if (data.conversationId === conversation.conversationId) {
      const pseudoMessage = {
        _id: `temp_${Date.now()}`,
        messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
        conversationId: data.conversationId,
        type: "notification",
        notification: {
          type: "avatarChange",
          actorId: userInfo?.userId,
          targetIds: [],
          content: "Hình nền nhóm đã được thay đổi.",
        },
        content: "Hình nền nhóm đã được thay đổi.",
        createdAt: new Date().toISOString(),
        senderId: null,
        sendStatus: "sent",
      };

      setMessages((prev) => [pseudoMessage, ...prev]);
      conversation.groupAvatarUrl = data.newAvatar;
    }
  };

  const handleGroupNameChanged = (data) => {
    if (data.conversationId === conversation.conversationId) {
      const pseudoMessage = {
        _id: `temp_${Date.now()}`,
        messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
        conversationId: data.conversationId,
        type: "notification",
        notification: {
          type: "nameChange",
          actorId: userInfo?.userId,
          targetIds: [],
          content: `Tên nhóm đã được đổi thành "${data.newName}".`,
        },
        content: `Tên nhóm đã được đổi thành "${data.newName}".`,
        createdAt: new Date().toISOString(),
        senderId: null,
        sendStatus: "sent",
      };

      setMessages((prev) => [pseudoMessage, ...prev]);
    }
  };

  const handleUserAddedToGroup = async (data) => {
    if (data.conversationId === conversation.conversationId) {
      const pseudoMessage = {
        _id: `temp_${Date.now()}`,
        messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
        conversationId: data.conversationId,
        type: "notification",
        notification: {
          type: "userAdded",
          actorId: data.addedByUser,
          targetIds: [data.addedUser],
          content: `Một thành viên mới đã được thêm vào nhóm.`,
        },
        content: `Một thành viên mới đã được thêm vào nhóm.`,
        createdAt: new Date().toISOString(),
        senderId: null,
        sendStatus: "sent",
      };
      setMessages((prev) => [pseudoMessage, ...prev]);

      const newMemberInfo = await fetchUserInfo(data.addedUser.userId);
      if (newMemberInfo) {
        const newMember = {
          id: data.addedUser.userId,
          role: "member",
          fullName: newMemberInfo.fullname,
          urlAvatar: newMemberInfo.urlavatar,
        };
        saveGroupMembers(conversation.conversationId, [
          ...groupMember,
          newMember,
        ]);
        console.log("User added to group:", newMember);
      }
    }
  };

  const handleUserLeftGroup = (data) => {
    if (data.conversationId === conversation.conversationId) {
      const pseudoMessage = {
        _id: `temp_${Date.now()}`,
        messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
        conversationId: data.conversationId,
        type: "notification",
        notification: {
          type: "userLeft",
          actorId: data.userId,
          targetIds: [],
          content: `Một thành viên đã rời nhóm.`,
        },
        content: `Một thành viên đã rời nhóm.`,
        createdAt: new Date().toISOString(),
        senderId: null,
        sendStatus: "sent",
      };
      setMessages((prev) => [pseudoMessage, ...prev]);

      const updatedGroupMembers = groupMember.filter(
        (member) => member.id !== data.userId
      );
      saveGroupMembers(conversation.conversationId, updatedGroupMembers);

      console.log(`User ${data.userId} đã rời nhóm ${data.conversationId}`);
    }
  };

  const handleUserRemovedFromGroup = (data) => {
    if (data.conversationId === conversation.conversationId) {
      if (data.kickedUser.userId === userInfo.userId) {
        handlerRefresh();
        Alert.alert(
          "Bạn đã bị xóa khỏi nhóm. Đang điều hướng về trang chính..."
        );
        navigation.navigate("Home");
      } else {
        const pseudoMessage = {
          _id: `temp_${Date.now()}`,
          messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
          conversationId: data.conversationId,
          type: "notification",
          notification: {
            type: "userRemoved",
            actorId: data.kickedByUser,
            targetIds: [data.kickedUser],
            content: `Một thành viên đã bị xóa khỏi nhóm.`,
          },
          content: `Một thành viên đã bị xóa khỏi nhóm.`,
          createdAt: new Date().toISOString(),
          senderId: null,
          sendStatus: "sent",
        };
        setMessages((prev) => [pseudoMessage, ...prev]);

        const updatedGroupMembers = groupMember.filter(
          (member) => member.id !== data.kickedUser.userId
        );
        saveGroupMembers(conversation.conversationId, updatedGroupMembers);
        console.log(
          `User ${data.kickedUser.userId} đã bị xóa khỏi nhóm ${data.conversationId}`
        );
      }
    }
  };

  const handleGroupOwnerChanged = (data) => {
    if (data.conversationId === conversation.conversationId) {
      const pseudoMessage = {
        _id: `temp_${Date.now()}`,
        messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
        conversationId: data.conversationId,
        type: "notification",
        notification: {
          type: "ownerChange",
          actorId: data.newOwner,
          targetIds: [],
          content: `Nhóm trưởng đã được truyền lại.`,
        },
        content: `Nhóm trưởng đã được truyền lại.`,
        createdAt: new Date().toISOString(),
        senderId: null,
        sendStatus: "sent",
      };
      setMessages((prev) => [pseudoMessage, ...prev]);
      changeRole(conversation.conversationId, data.newOwner, "owner");
      console.log(
        `Nhóm trưởng đã được truyền lại cho user ${data.newOwner} trong nhóm ${data.conversation.conversationId}`
      );
    }
  };

  const handleGroupCoOwnerAdded = (data) => {
    if (data.conversationId === conversation.conversationId) {
      const pseudoMessage = {
        _id: `temp_${Date.now()}`,
        messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
        conversationId: data.conversationId,
        type: "notification",
        notification: {
          type: "coOwnerAdded",
          actorId: null,
          targetIds: data.newCoOwnerIds,
          content: `Nhóm phó đã được thêm.`,
        },
        content: `Nhóm phó đã được thêm.`,
        createdAt: new Date().toISOString(),
        senderId: null,
        sendStatus: "sent",
      };
      setMessages((prev) => [pseudoMessage, ...prev]);
      changeRole(
        conversation.conversationId,
        data.newCoOwnerIds.join(", "),
        "co-owner"
      );
      console.log(
        `Nhóm phó đã được thêm: ${data.newCoOwnerIds.join(", ")} trong nhóm ${
          data.conversationId
        }`
      );
    }
  };

  const handleGroupCoOwnerRemoved = (data) => {
    if (data.conversationId === conversation.conversationId) {
      const pseudoMessage = {
        _id: `temp_${Date.now()}`,
        messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
        conversationId: data.conversationId,
        type: "notification",
        notification: {
          type: "coOwnerRemoved",
          actorId: null,
          targetIds: data.removedCoOwnerIds,
          content: `Nhóm phó đã bị loại bỏ.`,
        },
        content: `Nhóm phó đã bị loại bỏ.`,
        createdAt: new Date().toISOString(),
        senderId: null,
        sendStatus: "sent",
      };
      setMessages((prev) => [pseudoMessage, ...prev]);
      changeRole(conversation.conversationId, data.removedCoOwner, "member");
      console.log(
        `Nhóm phó đã bị loại bỏ: ${data.removedCoOwnerIds.join(
          ", "
        )} trong nhóm ${data.conversationId}`
      );
    }
  };

  const handleUserUnblocked = async (data) => {
    if (data.conversationId === conversation.conversationId) {
      const pseudoMessage = {
        _id: `temp_${Date.now()}`,
        messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
        conversationId: data.conversationId,
        type: "notification",
        notification: {
          type: "userAdded",
          targetIds: [data.unblockedUserId],
          content: `Một thành viên mới đã được thêm vào nhóm.`,
        },
        content: `Một thành viên mới đã được thêm vào nhóm.`,
        createdAt: new Date().toISOString(),
        senderId: null,
        sendStatus: "sent",
      };
      setMessages((prev) => [pseudoMessage, ...prev]);

      const unblockedUserInfo = await fetchUserInfo(data.unblockedUserId);
      if (unblockedUserInfo) {
        const unblockedMember = {
          id: data.unblockedUserId,
          role: "member",
          fullName: unblockedUserInfo.fullname,
          urlAvatar: unblockedUserInfo.urlavatar,
        };
        console.log("User unblocked and added to group:", unblockedMember);
      }
    }
  };

  const handleGroupDeleted = () => {
    handlerRefresh();
    Alert.alert("Nhóm đã bị xóa. Đang điều hướng về trang chính...");
    navigation.navigate("Home");
  };

  const handleUserBlocked = (data) => {
    if (data.conversationId === conversation.conversationId) {
      if (data.blockedUserId === userInfo.userId) {
        handlerRefresh();
        Alert.alert(
          "Bạn đã bị chặn khỏi nhóm. Đang điều hướng về trang chính..."
        );
        navigation.navigate("Home");
      } else {
        const pseudoMessage = {
          _id: `temp_${Date.now()}`,
          messageDetailId: `notif-${data.conversationId}-${Date.now()}`,
          conversationId: data.conversationId,
          type: "notification",
          notification: {
            type: "userBlocked",
            actorId: null,
            targetIds: [data.blockedUserId],
            content: `Một thành viên đã bị chặn.`,
          },
          content: `Một thành viên đã bị chặn.`,
          createdAt: new Date().toISOString(),
          senderId: null,
          sendStatus: "sent",
        };
        setMessages((prev) => [pseudoMessage, ...prev]);

        const updatedGroupMembers = groupMember.filter(
          (member) => member.id !== data.blockedUserId
        );
        saveGroupMembers(conversation.conversationId, updatedGroupMembers);
        console.log(
          `User ${data.blockedUserId} đã bị chặn trong nhóm ${data.conversationId}`
        );
      }
    }
  };

  // Đăng ký các sự kiện socket
  socket.on("newMessage", handleNewMessage);
  socket.on("newConversation", handleNewConversation);
  socket.on("messageRecalled", handleMessageRecalled);
  socket.on("messagePinned", handleMessagePinned);
  socket.on("messageUnpinned", handleMessageUnpinned);
  socket.on("groupAvatarChanged", handleGroupAvatarChanged);
  socket.on("groupNameChanged", handleGroupNameChanged);
  socket.on("userAddedToGroup", handleUserAddedToGroup);
  socket.on("userLeftGroup", handleUserLeftGroup);
  socket.on("userRemovedFromGroup", handleUserRemovedFromGroup);
  socket.on("groupOwnerChanged", handleGroupOwnerChanged);
  socket.on("groupCoOwnerAdded", handleGroupCoOwnerAdded);
  socket.on("groupCoOwnerRemoved", handleGroupCoOwnerRemoved);
  socket.on("groupDeleted", handleGroupDeleted);
  socket.on("userBlocked", handleUserBlocked);
  socket.on("userUnblocked", handleUserUnblocked);

  // Hàm cleanup
  return () => {
    socket.off("newMessage", handleNewMessage);
    socket.off("newConversation", handleNewConversation);
    socket.off("messageRecalled", handleMessageRecalled);
    socket.off("messagePinned", handleMessagePinned);
    socket.off("messageUnpinned", handleMessageUnpinned);
    socket.off("groupAvatarChanged", handleGroupAvatarChanged);
    socket.off("groupNameChanged", handleGroupNameChanged);
    socket.off("userAddedToGroup", handleUserAddedToGroup);
    socket.off("userLeftGroup", handleUserLeftGroup);
    socket.off("userRemovedFromGroup", handleUserRemovedFromGroup);
    socket.off("groupOwnerChanged", handleGroupOwnerChanged);
    socket.on("groupCoOwnerAdded", handleGroupCoOwnerAdded);
    socket.on("groupCoOwnerRemoved", handleGroupCoOwnerRemoved);
    socket.off("groupDeleted", handleGroupDeleted);
    socket.off("userBlocked", handleUserBlocked);
    socket.off("userUnblocked", handleUserUnblocked);
  };
};
