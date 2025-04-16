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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Color from "../../../components/colors/Color";
import postsData from "../../../../assets/objects/post.json";
import usersData from "../../../../assets/objects/user.json";
import AvatarUser from "../../../components/profile/AvatarUser";
import { AuthContext } from "@/app/auth/AuthContext";
import { api } from "../../../api/api"; 
import FullScreenImageViewer from "@/app/features/fullImages/FullScreenImageViewer"; 

const UserProfile = ({ route }) => {
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext); // Lấy thông tin người dùng từ AuthContext
  const [refreshing, setRefreshing] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));
  const [requestSent, setRequestSent] = useState(null);
  const [posts, setPosts] = useState(postsData);
  const [userExists, setUserExists] = useState(false); // Kiểm tra id có tồn tại trong usersData không
  const [user, setUser] = useState(null); // Lưu thông tin user

  // Thêm state cho ảnh bìa ngẫu nhiên
  const [randomImageId, setRandomImageId] = useState(
    Math.floor(Math.random() * 1000)
  );
  
  // URL ảnh bìa từ picsum.photos
  const coverImageUrl = `https://picsum.photos/id/${randomImageId}/800/400`;


  // Lấy id từ route.params
  const { friend, requestSent: initialRequestSent } = route.params || {};

  useEffect(() => {
    if (initialRequestSent) {
      setRequestSent(initialRequestSent);
    }
  }, [initialRequestSent]);

  

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const coverImageHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 300],
    extrapolate: "clamp",
  });

  const handleAddFriend = () => {
    navigation.navigate("AddFriend", { user });
  };

  const handleCancelRequest = () => {
    setRequestSent(null);
  };

  const handleAcceptRequest = () => {
    navigation.navigate("AcceptFriend", { user });
  };

  // Cập nhật renderPostImages để có thể xem ảnh
  const renderPostImages = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate("FullScreenImageViewer", {
        imageUrl: require("../../../../assets/images/avt.jpg"),
      })}
    >
      <Image
        source={require("../../../../assets/images/avt.jpg")}
        style={styles.postImage}
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      <View style={styles.container}>
        <View style={styles.coverContainer}>
          {/* Ảnh bìa với TouchableOpacity để xem ảnh */}
          <TouchableOpacity
            onPress={() => 
              navigation.navigate("FullScreenImageViewer", {
                imageUrl: coverImageUrl,
              })
            }
          >
            <Animated.Image
              source={{ uri: coverImageUrl }}
              style={[styles.coverImage, { height: coverImageHeight }]}
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
              <Icon
                name="more-horiz"
                size={24}
                color="#fff"
                style={styles.headerIcon}
              />
            </View>
          </View>
        </View>

        <View style={styles.overlay}>
          <View style={styles.avatarContainer}>
            {/* TouchableOpacity cho avatar để xem ảnh */}
            <TouchableOpacity
              onPress={() => 
                navigation.navigate("FullScreenImageViewer", {
                  imageUrl: friend?.urlavatar || null,
                  fallbackText: friend?.fullname || "User",
                })
              }
            >
              {friend?.urlavatar ? (
                <Image
                  source={{ uri: friend.urlavatar }}
                  style={styles.avatar}
                />
              ) : (
                <AvatarUser
                  fullName={friend?.fullname}
                  width={100}
                  height={100}
                  avtText={40}
                  shadow={true}
                  bordered={true}
                />
              )}
            </TouchableOpacity>
          </View>

          {!userExists ? (
            <>
              {requestSent === "friend" ? (
                <View style={styles.friendContainer}>
                  <>
                    <Text style={styles.statusText}>Công ty cổ phần thép TVP</Text>
                    <Text style={styles.statusText}>123456789</Text>
                    <Text style={styles.statusText}>user@gmail.com</Text>
                  </>
                </View>
              ) : (
                // Nếu không phải bạn bè
                <View style={styles.buttonContainer}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.editText}>
                      Bạn chưa thể xem nhật ký của {friend?.fullname || "Thành Nghiêm"}{" "}
                      khi chưa là bạn bè
                    </Text>
                  </View>
                  {requestSent === "accepted" ? (
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
                        <TouchableOpacity style={styles.deniedButton}>
                          <Text style={styles.deniedButtonText}>Từ chối</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleAcceptRequest}
                          style={styles.acceptedButton}
                        >
                          <Text style={styles.acceptedButtonText}>Đồng ý</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.buttonAndStatusContainer}>
                      <View style={styles.horizontalButtons}>
                        <TouchableOpacity style={styles.messageButton}>
                          <Ionicons
                            name="chatbubble-outline"
                            size={20}
                            color="#0066cc"
                          />
                          <Text style={styles.messageButtonText}>Nhắn tin</Text>
                        </TouchableOpacity>
                        {requestSent === "pending" ? (
                          <TouchableOpacity
                            style={styles.removeFriendButton}
                            onPress={handleCancelRequest}
                          >
                            <Ionicons
                              name="person-remove-outline"
                              size={20}
                              color="#666"
                            />
                            <Text style={styles.removeFriendButtonText}>
                              Hủy kết bạn
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={styles.addFriendButton}
                            onPress={handleAddFriend}
                          >
                            <Ionicons
                              name="person-add-outline"
                              size={20}
                              color="#666"
                            />
                            <Text style={styles.addFriendButtonText}>Kết bạn</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={styles.divider} />
                    </View>
                  )}
                </View>
              )}
            </>
          ) : (
            // Tiểu sử
            <>
              <Text style={styles.statusText}>Công ty cổ phần thép TVP</Text>
              <Text style={styles.statusText}>123456789</Text>
              <Text style={styles.statusText}>user@gmail.com</Text>
            </>
          )}

          {/* Add the new buttons here */}
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

          {/* Thêm các bài đăng */}
          <View style={styles.postsContainer}>
            {posts.map((post, index) => (
              <View style={styles.postContainer} key={index}>
                <Text style={styles.postDate}>{post.date}</Text>
                <View style={styles.post}>
                  <Text style={styles.postContent}>{post.content}</Text>

                  {/* FlatList hiển thị danh sách hình ảnh */}
                  <FlatList
                    data={[1, 2]} // Giả sử có 2 ảnh, bạn cần thay thế bằng dữ liệu thực tế
                    renderItem={renderPostImages}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal={true} // Hiển thị ảnh theo chiều ngang
                  />

                  <View style={styles.musicContainer}>
                    <Ionicons
                      name="musical-notes-outline"
                      size={20}
                      color="#7865C9"
                    />
                    <Text style={styles.musicText}>Bài hát: {post.music}</Text>
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
                  </View>
                  {/* Các nút Thích, Bình luận, ... */}
                  <View style={styles.postFooterRight}>
                    <View style={styles.footerIconsContainer}>
                      <TouchableOpacity style={styles.footerIcon}>
                        <Ionicons name="heart-outline" size={20} color="#888" />
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
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: "90%",
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
});

export default UserProfile;
