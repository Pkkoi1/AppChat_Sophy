// Tạo một conversation mặc định cho AI Assistant
import aiLogo from "../../assets/images/AI.png";
const RAI_ASSISTANT_ID = "rai-assistant";
const RAI_ASSISTANT_CONVERSATION = {
  conversationId: RAI_ASSISTANT_ID,
  isGroup: false,
  groupName: null,
  groupAvatarUrl: aiLogo,
  groupMembers: [],
  creatorId: RAI_ASSISTANT_ID,
  receiverId: RAI_ASSISTANT_ID,
  unreadCount: [],
  lastMessage: {
    senderId: RAI_ASSISTANT_ID,
    content: "Xin chào! Tôi là trợ lý AI. Bạn cần giúp gì?",
    type: "text",
    createdAt: new Date().toISOString(),
    isRecall: false,
  },
  receiver: {
    userId: RAI_ASSISTANT_ID,
    fullname: "Trợ lý AI",
    urlavatar: aiLogo,
  },
};

export { RAI_ASSISTANT_CONVERSATION, RAI_ASSISTANT_ID };
