import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  FlatList,
} from "react-native";
import {
  AntDesign,
  Feather,
  MaterialIcons,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";

const moments = [
  {
    id: 1,
    title: "Tạo mới",
    thumbnail: require("../../../assets/images/avt.jpg"),
    description: "",
    icon: "camera",
  },
  {
    id: 2,
    title: "Chatgpt Pt Shop",
    thumbnail: require("../../../assets/images/avt.jpg"),
    icon: "images",
  },
  {
    id: 3,
    title: "Nhu Phượng",
    thumbnail: require("../../../assets/images/avt.jpg"),
    icon: "images",
  },
  {
    id: 4,
    title: "Phú Lê",
    thumbnail: require("../../../assets/images/avt.jpg"),
    icon: "images",
  },
];

const diaryItems = [
  {
    id: 1,
    type: "moment",
    name: "Hoa Tranh",
    description: "Đã chia sẻ 13 hoạt động",
    image: require("../../../assets/images/avt.jpg"),
    postImage: require("../../../assets/images/avt.jpg"),
    likes: 3, // Thêm số lượt thích
  },
  {
    id: 2,
    type: "post",
    name: "ChatGPT Pt Shop",
    description: "A/C có nhu cầu mua Netflix, bảo hành 1-1, giá 89k.",
    image: require("../../../assets/images/avt.jpg"),
    postImage: require("../../../assets/images/avt.jpg"),
    likes: 0, // Thêm số lượt thích
  },
  {
    id: 3,
    type: "moment",
    name: "Hồ Chí Minh",
    description: "Đã thay đổi ảnh bìa của họ.",
    image: require("../../../assets/images/avt.jpg"),
    postImage: require("../../../assets/images/avt.jpg"),
    likes: 5, // Thêm số lượt thích
  },
  {
    id: 4,
    type: "post",
    name: "Phú Lê",
    description: "Đang livestream bán hàng lúc 20h hôm nay!",
    image: require("../../../assets/images/avt.jpg"),
    postImage: require("../../../assets/images/avt.jpg"),
    likes: 3, // Thêm số lượt thích
  },
];

const Diary = () => {
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useState(new Animated.Value(0))[0];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const translateY = scrollY.interpolate({
    inputRange: [-0, 0, 0],
    outputRange: [0, 0, -0],
    extrapolate: "clamp",
  });

  const renderMomentItem = ({ item }) => (
    <TouchableOpacity style={styles.momentItem}>
      <Image source={item.thumbnail} style={styles.momentThumbnail} />
      {item.icon && (
        <TouchableOpacity style={styles.iconContainer} onPress={() => console.log("Icon pressed!")}>
          <View style={styles.iconOverlay}>
            <Ionicons name={item.icon} size={24} color="#fff" />
          </View>
        </TouchableOpacity>
      )}
      <Text style={styles.momentTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  return (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require("../../../assets/images/avt.jpg")}
            style={styles.avatar}
          />
          <Text style={styles.headerText}>Hôm nay bạn thế nào?</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="images" size={16} color="#4CAF50" />
            <Text style={styles.tabText}>Ảnh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="videocam" size={16} color="#E91E63" />
            <Text style={styles.tabText}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="albums" size={16} color="#2196F3" />
            <Text style={styles.tabText}>Album</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="time" size={16} color="#FF9800" />
            <Text style={styles.tabText}>Kỷ niệm</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Khoảnh khắc</Text>
        <View style={{ height: 240 , backgroundColor: "#fff"}}>
          <FlatList
            data={moments}
            renderItem={renderMomentItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={styles.momentList}
            contentContainerStyle={{ paddingVertical: 10 }}
          />
        </View>

        <Animated.View style={{ transform: [{ translateY }] }}>
          {diaryItems.map((item) => (
            <View key={item.id} style={styles.postContainer}>
              <View style={styles.postHeader}>
                <Image source={item.image} style={styles.postAvatar} />
                <View style={styles.postInfo}>
                  <Text style={styles.postName}>{item.name}</Text>
                  <Text style={styles.postTime}>3 giờ trước</Text>
                </View>
                <TouchableOpacity style={styles.menuIcon}>
                  <Feather name="more-horizontal" size={20} color="#555" />
                </TouchableOpacity>
              </View>

              <Text style={styles.postDescription}>{item.description}</Text>

              {item.postImage && (
                <Image source={item.postImage} style={styles.postImage} />
              )}

              <View style={styles.interactionBar}>
                <TouchableOpacity style={styles.interactionButton}>
                  <AntDesign name="like2" size={20} color="#555" />
                  <Text style={styles.interactionText}>
                    Thích {item.likes > 0 && `♥ ${item.likes}`}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.interactionButton}>
                  <Feather name="message-circle" size={20} color="#555" />
                  <Text style={styles.interactionText}>Bình luận</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Animated.View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 10,
    paddingLeft: 10,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  headerText: {
    color: "#000",
    fontSize: 16,
    marginLeft: 10,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 10,
    borderBottomColor: "#f0f2f5",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    height: 30,
  },
  tabText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    padding: 10,
    backgroundColor: "#fff",
    
  },
  momentList: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  momentItem: {
    marginRight: 10,
    alignItems: "center",
  },
  momentThumbnail: {
    width: 150,
    height: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  iconContainer: {
    position: "absolute",
    bottom: "15%",
    alignSelf: "center",
  },
  iconOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
    padding: 5,
  },
  momentTitle: {
    position: "absolute",
    bottom: "5%",
    alignSelf: "center",
  },
  momentDescription: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: "#fff",
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderTopWidth: 10,
    borderTopColor: "#f0f2f5",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postInfo: {
    marginLeft: 10,
    flex: 1,
  },
  postName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  postTime: {
    fontSize: 12,
    color: "#777",
  },
  menuIcon: {
    padding: 5,
  },
  postDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  interactionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  interactionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  interactionText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#555",
  },
});

export default Diary;