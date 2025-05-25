import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/app/api/api";
import { SocketContext } from "../socket/SocketContext";
import * as Contacts from "expo-contacts";
import { Alert, Linking } from "react-native";
import { fetchName } from "../components/getUserInfo/UserName";
import { setupAuthSocketEvents } from "../socket/socketEvents/AuthSocketEvents";
import { pickExternalDirectory } from "@/app/storage/StorageService";

// Thêm import các hàm conversation từ file riêng, có chú thích tiếng Việt
import {
  checkLastMessageDifference,
  addConversation as addConversationHelper,
  removeConversation as removeConversationHelper,
} from "./conversationHelpers";
// Thêm import các hàm group từ file mới, xóa các hàm liên quan nhóm cũ trong file này, chỉ giữ lại các hàm đã wrap helper
import {
  updateGroupMembers as updateGroupMembersHelper,
  changeRole as changeRoleHelper,
  removeGroupMember as removeGroupMemberHelper,
  saveGroupMembers as saveGroupMembersHelper,
  fetchGroups as fetchGroupsHelper, // import fetchGroups từ groupHelpers
} from "./groupHelpers";
// Thêm import các hàm friend từ file mới
import {
  fetchFriends as fetchFriendsHelper,
  updateFriendsList as updateFriendsListHelper,
  fetchSentFriendRequests as fetchSentFriendRequestsHelper,
  fetchReceivedFriendRequests as fetchReceivedFriendRequestsHelper,
  fetchAllFriendData as fetchAllFriendDataHelper,
} from "./friendHelpers";
// Thêm import các hàm message từ file mới
import {
  saveMessages as saveMessagesHelper,
  getMessages as getMessagesHelper,
} from "./messageHelpers";
// Thêm import các hàm user từ file mới
import {
  getUserInfoById as getUserInfoByIdHelper,
  updateUserInfo as updateUserInfoHelper,
  login as loginHelper,
  register as registerHelper,
  logout as logoutHelper,
} from "./userHelpers";
// Thêm import các hàm contact từ file mới
import { getPhoneContacts as getPhoneContactsHelper } from "./contactHelpers";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [background, setBackground] = useState(null);
  const [phoneContacts, setPhoneContacts] = useState([]);
  const [usersInDB, setUsersInDB] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupMember, setGroupMember] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState(null);

  // Thêm state cho danh sách lời mời kết bạn đã gửi/đã nhận
  const [sentFriendRequests, setSentFriendRequests] = useState([]);
  const [receivedFriendRequests, setReceivedFriendRequests] = useState([]);
  const [friendRequestsLoading, setFriendRequestsLoading] = useState(false);
  const [friendRequestsError, setFriendRequestsError] = useState(null);

  // Thêm state cho screen
  const [screen, setScreen] = useState("Home");

  const socket = useContext(SocketContext);
  const flatListRef = useRef(null);
  const joinedConversationIds = useRef(new Set());
  // Hàm lấy danh sách nhóm (dùng từ file groupHelpers)
  const fetchGroups = useCallback(
    () => fetchGroupsHelper(setGroups, setGroupsLoading, setGroupMember),
    []
  );

  // Hàm lấy danh sách bạn bè (dùng từ file friendHelpers)
  const fetchFriends = useCallback(
    () => fetchFriendsHelper(setFriends, setFriendsLoading, setFriendsError),
    []
  );

  // Hàm cập nhật danh sách bạn bè (dùng từ file friendHelpers)
  const updateFriendsList = useCallback(
    (newFriend = null, removedFriendId = null) =>
      updateFriendsListHelper(
        setFriends,
        fetchFriends,
        newFriend,
        removedFriendId
      ),
    [fetchFriends]
  );

  // Hàm lấy danh sách lời mời kết bạn đã gửi (dùng từ file friendHelpers)
  const fetchSentFriendRequests = useCallback(
    () =>
      fetchSentFriendRequestsHelper(
        setSentFriendRequests,
        setFriendRequestsLoading,
        setFriendRequestsError
      ),
    []
  );

  // Hàm lấy danh sách lời mời kết bạn đã nhận (dùng từ file friendHelpers)
  const fetchReceivedFriendRequests = useCallback(
    () =>
      fetchReceivedFriendRequestsHelper(
        setReceivedFriendRequests,
        setFriendRequestsLoading,
        setFriendRequestsError
      ),
    []
  );

  // Hàm tổng hợp để fetch cả 3 loại danh sách (dùng từ file friendHelpers)
  const fetchAllFriendData = useCallback(
    () =>
      fetchAllFriendDataHelper(
        fetchFriends,
        fetchSentFriendRequests,
        fetchReceivedFriendRequests
      ),
    [fetchFriends, fetchSentFriendRequests, fetchReceivedFriendRequests]
  );

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const [token, refresh, user, storedBackground, convs] =
          await AsyncStorage.multiGet([
            "accessToken",
            "refreshToken",
            "userInfo",
            "background",
            "conversations",
          ]);

        if (token[1] && refresh[1] && user[1]) {
          setAccessToken(token[1]);
          setRefreshToken(refresh[1]);
          setUserInfo(JSON.parse(user[1]));
        }

        if (storedBackground[1]) {
          setBackground(storedBackground[1]);
        }

        if (convs[1]) {
          setConversations(JSON.parse(convs[1]));
        }
      } catch (err) {
        console.error("Error loading storage:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorage();
  }, []);

  useEffect(() => {
    if (socket && conversations.length > 0 && userInfo?.userId) {
      const allIds = conversations.map((conv) => conv.conversationId);
      socket.emit("joinUserConversations", allIds);
      console.log("📡 Đã join tất cả conversations:", allIds);
    }
  }, [socket, conversations, userInfo?.userId]);

  useEffect(() => {
    if (userInfo?.userId) {
      fetchAllFriendData();
    }
  }, [userInfo, fetchAllFriendData]);

  // Đăng ký socket events từ file ngoài
  useEffect(() => {
    if (!socket) return;
    // Đăng ký các sự kiện socket bằng hàm setupAuthSocketEvents
    const cleanup = setupAuthSocketEvents(
      socket,
      userInfo,
      setConversations,
      saveMessages,
      addConversation
    );
    return cleanup;
  }, [socket, userInfo, setConversations, saveMessages, addConversation]);

  const clearStorage = useCallback(async () => {
    try {
      await AsyncStorage.clear();
      console.log("Đã xóa sạch dữ liệu AsyncStorage");
    } catch (e) {
      console.error("Lỗi khi xóa AsyncStorage:", e);
    }
  }, []);

  // Hàm so sánh tin nhắn cuối cùng giữa local và server (dùng từ file conversationHelpers)
  const checkLastMessageDifference = useCallback(
    (conversationId) =>
      checkLastMessageDifference(conversations, userInfo, conversationId),
    [conversations, userInfo]
  );

  // Hàm thêm cuộc trò chuyện mới (dùng từ file conversationHelpers)
  const addConversation = useCallback(
    (conversationData) =>
      addConversationHelper(setConversations, conversationData),
    []
  );

  // Hàm xóa cuộc trò chuyện (dùng từ file conversationHelpers)
  const removeConversation = useCallback(
    (conversationId) =>
      removeConversationHelper(
        {
          conversations,
          userInfo,
          setConversations,
          handlerRefresh,
          socket,
        },
        conversationId
      ),
    [conversations, userInfo, setConversations, handlerRefresh, socket]
  );

  // Hàm thêm thành viên nhóm (dùng từ file groupHelpers)
  const updateGroupMembers = useCallback(
    (conversationId, newMembers) =>
      updateGroupMembersHelper(
        setConversations,
        setGroupMember,
        conversationId,
        newMembers
      ),
    []
  );

  // Hàm đổi vai trò thành viên nhóm (dùng từ file groupHelpers)
  const changeRole = useCallback(
    (conversationId, memberId, newRole) =>
      changeRoleHelper(setGroupMember, conversationId, memberId, newRole),
    []
  );

  // Hàm xóa thành viên nhóm (dùng từ file groupHelpers)
  const removeGroupMember = useCallback(
    (conversationId, memberId) =>
      removeGroupMemberHelper(
        setConversations,
        setGroupMember,
        conversationId,
        memberId
      ),
    []
  );

  // Hàm lưu danh sách thành viên nhóm (dùng từ file groupHelpers)
  const saveGroupMembers = useCallback(
    (...args) => {
      console.log("saveGroupMembers called (AuthContext)");
      console.log("Thành viên nhóm (conversations):", conversations);
      console.log("Thành viên nhóm (groupMember):", groupMember);
      // Gọi helper thực sự
      return saveGroupMembersHelper(setGroupMember, ...args);
    },
    [conversations, groupMember]
  );

  // Hàm lưu tin nhắn (dùng từ file messageHelpers)
  const saveMessages = useCallback(
    (conversationId, newMessages, position = "before", onSaveComplete) =>
      saveMessagesHelper(
        setConversations,
        conversationId,
        newMessages,
        position,
        onSaveComplete
      ),
    []
  );

  // Hàm lấy tin nhắn (dùng từ file messageHelpers)
  const getMessages = useCallback(
    (conversationId) => getMessagesHelper(conversationId),
    []
  );

  // Hàm lấy thông tin user (dùng từ file userHelpers)
  const getUserInfoById = useCallback(
    (id) => getUserInfoByIdHelper(setUserInfo, id),
    []
  );

  // Hàm cập nhật thông tin user (dùng từ file userHelpers)
  const updateUserInfo = useCallback(
    (newInfo) => updateUserInfoHelper(setUserInfo, userInfo, newInfo),
    [userInfo]
  );

  // Hàm đăng nhập (dùng từ file userHelpers)
  const login = useCallback(
    (params) =>
      loginHelper({
        params,
        setAccessToken,
        setRefreshToken,
        setUserInfo,
        socket,
        handlerRefresh,
      }),
    [setAccessToken, setRefreshToken, setUserInfo, socket, handlerRefresh]
  );

  // Hàm đăng ký (dùng từ file userHelpers)
  const register = useCallback(
    (params) =>
      registerHelper({
        params,
        setAccessToken,
        setRefreshToken,
        setUserInfo,
        socket,
        handlerRefresh,
      }),
    [setAccessToken, setRefreshToken, setUserInfo, socket, handlerRefresh]
  );

  // Hàm đăng xuất (dùng từ file userHelpers)
  const logout = useCallback(
    () =>
      logoutHelper({
        setAccessToken,
        setRefreshToken,
        setUserInfo,
        setConversations,
        setBackground,
        clearStorage,
      }),
    [
      setAccessToken,
      setRefreshToken,
      setUserInfo,
      setConversations,
      setBackground,
      clearStorage,
    ]
  );

  // Hàm refresh dữ liệu (cập nhật danh sách cuộc trò chuyện, nhóm, bạn bè...)
  const handlerRefresh = useCallback(async () => {
    try {
      const conversationsResponse = await api.conversations();
      if (conversationsResponse && conversationsResponse.data) {
        const filteredConversations = conversationsResponse.data
          .filter(
            (conversation) =>
              !conversation.formerMembers.includes(userInfo?.userId) &&
              !conversation.isDeleted &&
              (!conversation.isGroup ||
                conversation.groupMembers.includes(userInfo?.userId))
          )
          .map((conv) => ({
            ...conv,
            messages:
              conversations.find(
                (c) => c.conversationId === conv.conversationId
              )?.messages || [],
          }))
          .sort((a, b) => {
            const timeA = a.lastMessage?.createdAt
              ? new Date(a.lastMessage.createdAt)
              : new Date(0);
            const timeB = b.lastMessage?.createdAt
              ? new Date(b.lastMessage.createdAt)
              : new Date(0);
            return timeB - timeA;
          });

        setConversations(filteredConversations);
        await AsyncStorage.setItem(
          "conversations",
          JSON.stringify(filteredConversations)
        );
      }
      await fetchGroups();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [userInfo?.userId, fetchGroups]); // Loại conversations ra

  const updateBackground = useCallback(async (newBackground) => {
    setBackground(newBackground);
    await AsyncStorage.setItem("background", newBackground);
  }, []);

  // Hàm lấy danh bạ (dùng từ file contactHelpers)
  const getPhoneContacts = useCallback(
    () =>
      getPhoneContactsHelper(
        setPhoneContacts,
        setUsersInDB,
        setContactsLoading,
        setContactsError
      ),
    []
  );

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        userInfo,
        isLoading,
        conversations,
        background,
        groupMember,
        setBackground,
        register,
        login,
        logout,
        updateUserInfo,
        getUserInfoById,
        handlerRefresh,
        updateBackground,
        setGroupMember,
        phoneContacts,
        usersInDB,
        getPhoneContacts,
        contactsLoading,
        contactsError,
        groups,
        groupsLoading,
        fetchGroups,
        addConversation,
        removeConversation,
        checkLastMessageDifference,
        updateGroupMembers,
        removeGroupMember,
        saveGroupMembers,
        changeRole,
        getMessages,
        saveMessages,
        friends,
        friendsLoading,
        friendsError,
        fetchFriends,
        updateFriendsList,
        sentFriendRequests,
        receivedFriendRequests,
        friendRequestsLoading,
        friendRequestsError,
        fetchSentFriendRequests,
        fetchReceivedFriendRequests,
        fetchAllFriendData,
        screen,
        setScreen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
