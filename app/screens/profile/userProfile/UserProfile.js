import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  TextInput,
  RefreshControl,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Color from "../../../components/colors/Color";
import postsData from "../../../../assets/objects/post.json";
import AvatarUser from "../../../components/profile/AvatarUser";
import { AuthContext } from "@/app/auth/AuthContext";
import { SocketContext } from "../../../socket/SocketContext"; // Import SocketContext
import { api } from "../../../api/api"; // Import API

const UserProfile = ({ route }) => {
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);
  const socket = useContext(SocketContext); // Access socket instance
  const [refreshing, setRefreshing] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [posts, setPosts] = useState(postsData);
  const [userExists, setUserExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [friendRequestMessage, setFriendRequestMessage] = useState("");
  const [randomImageId, setRandomImageId] = useState(
    Math.floor(Math.random() * 1000)
  );
  const coverImageUrl = `https://picsum.photos/id/${randomImageId}/800/400`;
  const { friend, requestSent: initialRequestSent } = route.params || {};
  const [requestSent, setRequestSent] = useState(initialRequestSent || null);

  useEffect(() => {
    setRequestSent(initialRequestSent || null);
  }, [initialRequestSent]);

  // Lắng nghe sự kiện 'userExists' từ server de tao cuoc tro chuyen
  useEffect(() => {
    if (!socket || !userInfo?.userId) return;

    // Lắng nghe sự kiện 'newConversation'
    socket.on("newConversation", (data) => {
      console.log("New conversation received:", data);
      if (data?.conversation) {
        Alert.alert("Thông báo", "Bạn có một cuộc trò chuyện mới!", [
          {
            text: "Xem ngay",
            onPress: () => {
              navigation.navigate("Chat", {
                conversation: data.conversation,
              });
            },
          },
          { text: "Đóng", style: "cancel" },
        ]);
      }
    });

    // Cleanup socket listener khi component unmount
    return () => {
      socket.off("newConversation");
    };
  }, [socket, userInfo?.userId]);

  // Socket Event Listeners
  useEffect(() => {
    if (!socket || !friend?.userId) return;

    // Listen for new friend request
    socket.on("newFriendRequest", (data) => {
      console.log("Received new friend request:", data);
      if (
        data.receiverId === userInfo.userId &&
        data.senderId === friend.userId
      ) {
        setRequestSent("accepted"); // Update UI to show received request
        setRequestId(data.friendRequestId); // Store request ID
        Alert.alert(
          "Lời mời kết bạn",
          `${data.senderName} đã gửi lời mời kết bạn!`
        );
      }
    });

    socket.on("acceptedFriendRequest", (data) => {
      console.log("data:", data);
      console.log("Request ID:", friend);
      setRequestSent("friend");
      setRequestId(null);
      Alert.alert("Thông báo", "Lời mời kết bạn đã được chấp nhận!");
    });

    socket.on("rejectedFriendRequest", (data) => {
      setRequestSent(null);
      setRequestId(null);
      Alert.alert("Thông báo", "Lời mời kết bạn đã bị từ chối.");
    });

    socket.on("retrievedFriendRequest", (data) => {
      setRequestSent(null);
      setRequestId(null);
      Alert.alert("Thông báo", "Lời mời kết bạn đã bị thu hồi.");
    });

    const handleAcceptedFriendRequest = ({ friendRequestData }) => {
      // friendRequestData là ID
      if (requestId && friendRequestData === requestId) {
        setRequestSent("friend");
        setRequestId(null);
        Alert.alert("Thông báo", "Lời mời kết bạn đã được chấp nhận.");
      }
    };

    const handleRejectedFriendRequest = ({ friendRequestData }) => {
      if (requestId && friendRequestData === requestId) {
        setRequestSent(null);
        setRequestId(null);
        Alert.alert("Thông báo", "Lời mời kết bạn đã bị từ chối.");
      }
    };

    const handleRetrievedFriendRequest = ({ friendRequestData }) => {
      if (requestId && friendRequestData === requestId) {
        setRequestSent(null);
        setRequestId(null);
        Alert.alert("Thông báo", "Lời mời kết bạn đã bị thu hồi.");
      }
    };

    socket.on("rejectedFriendRequest", handleRejectedFriendRequest);
    socket.on("acceptedFriendRequest", handleAcceptedFriendRequest);
    socket.on("retrievedFriendRequest", handleRetrievedFriendRequest);

    // Cleanup socket listeners on component unmount
    return () => {
      socket.off("rejectedFriendRequest", handleRejectedFriendRequest);
      socket.off("acceptedFriendRequest", handleAcceptedFriendRequest);
      socket.off("retrievedFriendRequest", handleRetrievedFriendRequest);
    };
  }, [socket, friend?.userId, userInfo.userId]);

  const onRefresh = () => {
    setRefreshing(true);
    setRandomImageId(Math.floor(Math.random() * 1000));
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleCreateConversation = async () => {
    try {
      if (!friend?.userId) {
        Alert.alert(
          "Lỗi",
          "Không thể tạo cuộc trò chuyện: Không có ID người dùng."
        );
        return;
      }

      // Kiểm tra xem cuộc trò chuyện đã tồn tại chưa
      try {
        const existingConversation = await api.getConversationById(
          friend.conversationId
        );
        if (existingConversation) {
          // Nếu cuộc trò chuyện đã tồn tại, chuyển đến màn hình Chat với conversationId
          navigation.navigate("Chat", {
            conversation: existingConversation,
            receiver: friend,
          });
          return;
        }
      } catch (error) {
        // Nếu không tìm thấy cuộc trò chuyện, tiếp tục tạo mới
        console.log("Cuộc trò chuyện không tồn tại, tạo mới:", error);
      }

      // Tạo cuộc trò chuyện mới nếu không tìm thấy cuộc trò chuyện cũ
      const conversation = await api.createConversation(friend.userId);
      if (conversation?.conversationId) {
        navigation.navigate("Chat", {
          conversation: conversation,
          receiver: friend,
        });
      } else {
        Alert.alert("Lỗi", "Không thể tạo cuộc trò chuyện.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo cuộc trò chuyện:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tạo cuộc trò chuyện.");
    }
  };

  const coverImageHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 300],
    extrapolate: "clamp",
  });

  const handleViewImage = (imageUrl, fallbackText) => {
    navigation.navigate("FullScreenImageViewer", {
      imageUrl,
      fallbackText,
    });
  };

  const handleAddFriend = async () => {
    if (!friend || !friend.userId) {
      Alert.alert(
        "Lỗi",
        "Không thể xác định người dùng để gửi lời mời kết bạn"
      );
      return;
    }

    try {
      setLoading(true);
      const userCheck = await api.getUserById(friend.userId);
      if (!userCheck || !userCheck.data) {
        throw new Error("Không tìm thấy người dùng");
      }
      const response = await api.sendFriendRequest(
        friend.userId,
        friendRequestMessage
      );
      setRequestSent("pending");
      setRequestId(response.friendRequestId || response.userId);

      // Emit socket event to notify the receiver
      socket.emit("sendFriendRequest", {
        senderId: userInfo.userId,
        senderName: userInfo.fullname,
        receiverId: friend.userId,
        friendRequestId: response.friendRequestId || response.userId,
      });

      Alert.alert("Thành công", "Đã gửi lời mời kết bạn!");
    } catch (error) {
      console.error("Lỗi khi gửi lời mời kết bạn:", error);
      if (error.response) {
        if (error.response.status === 404) {
          Alert.alert(
            "Không tìm thấy",
            "Người dùng không tồn tại hoặc đã bị xóa"
          );
        } else if (
          error.response.status === 400 &&
          error.response.data.message.includes("already sent")
        ) {
          Alert.alert(
            "Thông báo",
            "Bạn đã gửi lời mời kết bạn cho người này rồi"
          );
          setRequestSent("pending");
        } else if (
          error.response.status === 400 &&
          error.response.data.message.includes("already friends")
        ) {
          Alert.alert("Thông báo", "Hai bạn đã là bạn bè rồi");
          setRequestSent("friend");
        } else {
          Alert.alert(
            "Lỗi",
            error.response.data.message || "Không thể gửi lời mời kết bạn."
          );
        }
      } else {
        Alert.alert("Lỗi kết nối", "Không thể kết nối đến máy chủ.");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleRejectRequest = async () => {
    try {
      setLoading(true);
      let rejectRequestId = requestId;

      if (!rejectRequestId) {
        const receivedRequests = await api.getFriendRequestsReceived();
        console.log("Received Requests:", receivedRequests);

        const foundRequest = receivedRequests.find(
          (req) => req.senderId?.userId === friend.userId
        );
        if (foundRequest) {
          rejectRequestId = foundRequest.friendRequestId;
        } else {
          throw new Error("Không tìm thấy lời mời kết bạn để từ chối");
        }
      }
      console.log("Friend User ID:", rejectRequestId);
      await api.rejectFriendRequest(rejectRequestId);
      setRequestSent(null);
      setRequestId(null);

      // Emit socket event to notify the sender
      socket.emit("rejectFriendRequest", {
        senderId: friend.userId,
        receiverId: userInfo.userId,
        receiverName: userInfo.fullname,
        friendRequestId: rejectRequestId,
      });

      Alert.alert("Thành công", "Đã từ chối lời mời kết bạn!");
    } catch (error) {
      console.error("Lỗi khi từ chối lời mời kết bạn:", error);
      Alert.alert("Lỗi", error.message || "Không thể từ chối lời mời kết bạn.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setLoading(true);
      let cancelRequestId = requestId;

      if (!cancelRequestId) {
        const sentRequests = await api.getFriendRequestsSent();
        console.log("Sent Requests:", sentRequests);
        console.log("Friend User ID:", friend.userId);

        const foundRequest = sentRequests.find(
          (req) => req.receiverId.userId === friend.userId
        );

        if (foundRequest) {
          cancelRequestId = foundRequest.friendRequestId || foundRequest.userId;
        } else {
          throw new Error("Không tìm thấy lời mời kết bạn để hủy");
        }
      }

      await api.retrieveFriendRequest(cancelRequestId);
      setRequestSent(null);
      setRequestId(null);

      // Emit socket event to notify the receiver
      socket.emit("retrieveFriendRequest", {
        senderId: userInfo.userId,
        senderName: userInfo.fullname,
        receiverId: friend.userId,
        friendRequestId: cancelRequestId,
      });

      Alert.alert("Thành công", "Đã hủy lời mời kết bạn!");
    } catch (error) {
      console.error("Lỗi khi hủy lời mời kết bạn:", error);
      Alert.alert("Lỗi", error.message || "Không thể hủy lời mời kết bạn.");
    } finally {
      setLoading(false);
    }
  };
  const handleNavigateToUserInfo = () => {
    navigation.navigate("UserInfo", {
      user: friend,
      // Truyền thêm thông tin cần thiết
      isFriend: requestSent === "friend",
    });
  };

  const renderPostImages = ({ item }) => (
    <TouchableOpacity onPress={() => {}}>
      <Image
        source={require("../../../../assets/images/avt.jpg")}
        style={styles.postImage}
      />
    </TouchableOpacity>
  );

  const renderFriendStatus = () => {
    if (requestSent === "friend") {
  return (
    <View style={styles.friendContainer}>
      <Text style={styles.statusText}>Phan Hoang Tan</Text>
      <Text style={styles.statusText}>{friend?.phone || "0792764303"}</Text>
      <Text style={styles.statusText}>
        {friend?.email || "tan@gmail.com"}
      </Text>
    </View>
  );
}

// Trang thai da gui loi moi ket ban
if (requestSent === "pending") {
  return (
    <View style={styles.buttonAndStatusContainer}>
      <View style={styles.horizontalButtons}>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={handleCreateConversation}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#0066cc" />
          <Text style={styles.messageButtonText}>Nhắn tin</Text>
        </TouchableOpacity>
        <View style={styles.buttonWrapper}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#666" />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addFriendButton}
              onPress={handleCancelRequest}
            >
              <Ionicons name="person-remove-outline" size={20} color="#666" />
              <Text style={styles.addFriendButtonText}>Hủy kết bạn</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  );
}

    if (requestSent === "accepted") {
      return (
        <View style={styles.requestInfoContainer}>
          <Text style={styles.requestTitle}>
            Gửi lời mời kết bạn từ nhóm chung
          </Text>
          <View style={styles.requestInfo}>
            <Icon
              name="person"
              size={20}
              color="#888"
              style={styles.requestIcon}
            />
            <Text style={styles.requestLabel}>
              Tên Zalo: {friend?.fullname || "Thủy Lê"}
            </Text>
          </View>
          <View style={styles.requestInfo}>
            <Icon
              name="group"
              size={20}
              color="#888"
              style={styles.requestIcon}
            />
            <Text style={styles.requestInfo}>
              Nhóm chung: Flipgrid_Experimental Group.{" "}
              <Text style={styles.link}>Xem chi tiết</Text>
            </Text>
          </View>
          <TextInput
            style={styles.requestInput}
            value={`Xin chào, tôi là ${friend?.fullname || "Thủy Lê"}`}
            editable={false}
          />
          <View style={styles.actionButtons}>
            {loading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              // Giao dien cho người nhận lời mời kết bạn
              <>
                <TouchableOpacity
                  style={styles.deniedButton}
                  onPress={handleRejectRequest}
                >
                  <Text style={styles.deniedButtonText}>Từ chối</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateConversation}
                  style={styles.acceptedButton}
                >
                  <Text style={styles.acceptedButtonText}>Đồng ý</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.buttonContainer}>
        <View style={styles.avatarContainer}>
          <Text style={styles.editText}>
            Bạn chưa thể xem nhật ký của {friend?.fullname || "Thành Nghiêm"}{" "}
            khi chưa là bạn bè
          </Text>
        </View>
        <View style={styles.buttonAndStatusContainer}>
          <View style={styles.horizontalButtons}>
            <TouchableOpacity
              style={styles.messageButton}
              onPress={handleCreateConversation}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#0066cc" />
              <Text style={styles.messageButtonText}>Nhắn tin</Text>
            </TouchableOpacity>
            {loading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              // Trang thai chưa kết bạn
              <TouchableOpacity
                style={styles.addFriendButton}
                onPress={handleAddFriend}
              >
                <Ionicons name="person-add-outline" size={20} color="#666" />
                <Text style={styles.addFriendButtonText}>Kết bạn</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.divider} />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
          }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.container}>
          <View style={styles.coverContainer}>
            <TouchableOpacity
              onPress={() => handleViewImage(coverImageUrl)}
              activeOpacity={0.8}
            >
              <Animated.Image
                source={{ uri: coverImageUrl }}
                style={[styles.coverImage, { height: coverImageHeight }]}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back-ios" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.headerIcons}>
                <Ionicons
                  name="call-outline"
                  size={24}
                  color="#fff"
                  style={styles.headerIcon}
                />
                <TouchableOpacity onPress={handleNavigateToUserInfo}>
                  <Icon
                    name="more-horiz"
                    size={24}
                    color="#fff"
                    style={styles.headerIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.overlay}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity
                onPress={() =>
                  handleViewImage(friend?.urlavatar, friend?.fullname || "User")
                }
                activeOpacity={0.8}
              >
                {friend?.urlavatar ? (
                  <Image
                    source={{ uri: friend.urlavatar }}
                    style={styles.avatar}
                  />
                ) : (
                  <AvatarUser
                    fullName={friend?.fullname || ""}
                    width={120}
                    height={120}
                    avtText={40}
                    shadow={true}
                    bordered={true}
                  />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.nameContainer}>
              <Text style={styles.name}>
                {friend?.fullname || "Người dùng"}
              </Text>
            </View>

            {renderFriendStatus()}

            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.optionButton}>
                <Icon name="photo" size={22} color="#0066cc" />
                <Text style={styles.optionText}>Ảnh 123</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton}>
                <Icon name="videocam" size={22} color="#128fb0" />
                <Text style={styles.optionText}>Video 11</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.postsContainer}>
              {posts.map((post, index) => (
                <View style={styles.postContainer} key={index}>
                  <Text style={styles.postDate}>{post.date}</Text>
                  <View style={styles.post}>
                    <Text style={styles.postContent}>{post.content}</Text>
                    <FlatList
                      data={[1, 2]}
                      renderItem={renderPostImages}
                      keyExtractor={(item, index) => index.toString()}
                      horizontal={true}
                    />
                    <View style={styles.musicContainer}>
                      <Ionicons
                        name="musical-notes-outline"
                        size={20}
                        color="#7865C9"
                      />
                      <Text style={styles.musicText}>
                        Bài hát: {post.music}
                      </Text>
                    </View>
                    <View style={styles.postFooter}>
                      <View style={styles.postFooterLeft}>
                        <View style={styles.iconAndText}>
                          <Ionicons
                            style={styles.icon}
                            name="heart"
                            size={20}
                            color="#f00"
                          />
                          <Text style={styles.postLikes}>{post.likes} bạn</Text>
                        </View>
                        <View style={styles.iconAndText}>
                          <Text style={styles.postComments}>
                            {post.comments} bình luận
                          </Text>
                        </View>
                      </View>
                      <View style={styles.postFooterRight}>
                        <View style={styles.footerIconsContainer}>
                          <TouchableOpacity style={styles.footerIcon}>
                            <Ionicons
                              name="heart-outline"
                              size={20}
                              color="#888"
                            />
                            <Text style={styles.footerText}>Thích</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.footerIcon}>
                            <Ionicons
                              name="chatbox-ellipses-outline"
                              size={20}
                              color="#888"
                            />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity>
                          <Icon name="more-horiz" size={20} color="#888" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      {requestSent === "friend" && (
        <TouchableOpacity
          style={styles.floatingMessageButton}
          onPress={handleCreateConversation}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Styles remain the same

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverContainer: {
    position: "relative",
    height: 200,
  },
  coverImage: {
    width: "100%",
    resizeMode: "cover",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    paddingTop: 40,
    zIndex: 1,
  },
  headerIcons: {
    flexDirection: "row",
  },
  headerIcon: {
    marginLeft: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  avatarContainer: {
    alignItems: "center",
    paddingTop: 20,
    marginTop: -50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#00cc00",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarText: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold",
  },
  name: {
    fontSize: 24,
    color: "#000",
    marginVertical: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  editText: {
    color: "#505050",
    marginVertical: 20,
    fontSize: 14,
    textAlign: "center",
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonAndStatusContainer: {
    width: "90%",
    alignItems: "center",
  },
  horizontalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Color.blueBackgroundButton2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    flex: 1,
  },
  messageButtonText: {
    fontSize: 16,
    color: "#0066cc",
    marginLeft: 5,
    fontWeight: "500",
    textAlign: "center",
  },
  addFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
  },
  removeFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
  },
  addFriendButtonText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 5,
    fontWeight: "500",
    textAlign: "center",
  },
  removeFriendButtonText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 5,
    fontWeight: "500",
    textAlign: "center",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 15,
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  requestInfoContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    shadowRadius: 5,
    // elevation: 3,
    width: "90%",
    alignSelf: "center",
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 15,
    textAlign: "center",
  },
  requestInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  requestIcon: {
    marginRight: 10,
  },
  requestLabel: {
    fontSize: 16,
    color: "#000",
  },
  groupInfo: {
    fontSize: 14,
    color: "#666",
  },
  link: {
    color: "#007AFF",
    fontSize: 14,
  },
  requestInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#000",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  acceptedButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginRight: 10,
    flex: 1,
    alignItems: "center",
  },
  deniedButton: {
    backgroundColor: "#E5E5EA",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginRight: 10,
    flex: 1,
    alignItems: "center",
  },
  acceptedButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
    textAlign: "center",
  },
  deniedButtonText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
    textAlign: "center",
  },
  postsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  postContainer: {
    marginBottom: 15,
  },
  post: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  postDate: {
    marginVertical: 5,
    marginHorizontal: 5,
    fontSize: 14,
    color: "#000",
    backgroundColor: "#E0E3EA",
    padding: 5,
    alignSelf: "flex-start",
    borderRadius: 5,
  },
  postContent: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  postImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  musicContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  musicText: {
    fontSize: 14,
    color: "#888",
    marginLeft: 5,
  },
  postFooter: {
    flexDirection: "column", // Changed to column
    justifyContent: "space-between",
    alignItems: "flex-start", // Aligned to start
    marginVertical: 5,
  },
  postFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  postFooterRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Added to distribute buttons evenly
    width: "100%", // Take full width
    marginTop: 10, // Add some space between left and right sections
  },
  footerIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  postLikes: {
    fontSize: 14,
    color: "#888",
    marginLeft: 5,
  },
  postComments: {
    fontSize: 14,
    color: "#888",
    marginLeft: 5,
  },
  footerIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 5, // Removed to allow even distribution
    backgroundColor: Color.grayBackgroundButton,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#000",
    marginLeft: 5,
  },
  iconAndText: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    backgroundColor: Color.grayBackgroundButton,
    borderRadius: 30,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Changed to center
    paddingHorizontal: 55,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  optionText: {
    fontSize: 12,
    color: "#000",
    textAlign: "center", // Added textAlign
  },
  addFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
    marginLeft: 10, // Thêm dòng này cho cân đối
  },
  removeFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 1,
    marginLeft: 10, // Thêm dòng này cho cân đối
  },
  floatingMessageButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: Color.sophy,
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5, // for Android shadow
    shadowColor: "#000", // for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});

export default UserProfile;
