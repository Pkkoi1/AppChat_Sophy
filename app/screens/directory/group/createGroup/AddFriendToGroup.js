import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../../api/api";
import AvatarUser from "@/app/components/profile/AvatarUser";
import { AuthContext } from "@/app/auth/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
import OptionHeader from "@/app/features/optionHeader/OptionHeader";
import Color from "@/app/components/colors/Color";

const AddFriendToGroup = ({ route }) => {
  const { conversation } = route.params;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const { handlerRefresh, updateGroupMembers } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    loadFriends();
  }, []);

  // Tải danh sách bạn bè và lọc những người đã trong nhóm
  const loadFriends = async () => {
    try {
      setIsLoading(true);
      const friendList = await api.getFriends();

      // Lọc ra bạn bè không có trong nhóm hiện tại
      const filteredFriends = friendList.filter(
        (friend) => !conversation.groupMembers.includes(friend.userId)
      );

      // Sắp xếp bạn bè theo tên
      filteredFriends.sort((a, b) =>
        (a.fullname || "").localeCompare(b.fullname || "")
      );

      setFriends(filteredFriends);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bạn bè:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách bạn bè.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const delaySearch = setTimeout(() => {
      const results = friends.filter(
        (friend) =>
          (friend.fullname || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (friend.phone || "").includes(searchQuery)
      );
      setSearchResults(results);
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, friends]);

  const handleContactClick = (friend) => {
    // Toggle selection
    if (selectedFriends.some((item) => item._id === friend._id)) {
      setSelectedFriends(
        selectedFriends.filter((item) => item._id !== friend._id)
      );
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const handleAddToGroup = async () => {
    if (selectedFriends.length === 0) {
      Alert.alert(
        "Thông báo",
        "Vui lòng chọn ít nhất một người để thêm vào nhóm"
      );
      return;
    }

    setIsLoading(true);
    try {
      const addedMembers = [];
      for (const friend of selectedFriends) {
        await api.addUserToGroup(conversation.conversationId, friend.userId);
        const memberInfo = await fetchUserInfo(friend.userId);
        addedMembers.push({
          id: friend.userId,
          fullName: memberInfo?.fullname || "Unknown",
          urlAvatar: memberInfo?.urlavatar || null,
          role: "member",
        });
      }

      // Save added members to groupMember using updateGroupMembers
      await updateGroupMembers(conversation.conversationId, addedMembers);

      Alert.alert(
        "Thành công",
        `Đã thêm ${selectedFriends.length} người vào nhóm`,
        [
          {
            text: "OK",
            onPress: () => {
              handlerRefresh();

              // Lọc danh sách bạn bè để loại bỏ những người vừa thêm
              setFriends((prevFriends) =>
                prevFriends.filter(
                  (friend) =>
                    !selectedFriends.some(
                      (selected) => selected._id === friend._id
                    )
                )
              );

              // Lọc danh sách tìm kiếm để loại bỏ những người vừa thêm
              setSearchResults((prevSearchResults) =>
                prevSearchResults.filter(
                  (friend) =>
                    !selectedFriends.some(
                      (selected) => selected._id === friend._id
                    )
                )
              );

              // Reset danh sách đã chọn
              setSelectedFriends([]);

              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Lỗi",
        "Không được quyền thêm thành viên này vào nhóm do thành viên đã bị chặn."
      );
    } finally {
      setIsLoading(false);
    }
  };
  // Nhóm bạn bè theo chữ cái đầu tiên
  const groupFriendsByFirstLetter = () => {
    const groupedData = [];
    const sections = {};

    const dataSource = searchQuery.trim() !== "" ? searchResults : friends;

    dataSource.forEach((friend) => {
      const firstLetter = (friend.fullname || " ")[0].toUpperCase();
      if (!sections[firstLetter]) {
        sections[firstLetter] = [];
        groupedData.push({
          title: firstLetter,
          data: sections[firstLetter],
        });
      }
      sections[firstLetter].push(friend);
    });

    // Sắp xếp các section theo thứ tự bảng chữ cái
    groupedData.sort((a, b) => a.title.localeCompare(b.title));

    return groupedData;
  };

  const renderFriendItem = ({ item }) => {
    const isSelected = selectedFriends.some(
      (friend) => friend._id === item._id
    );

    return (
      <TouchableOpacity
        style={styles.friendItem}
        onPress={() => handleContactClick(item)}
      >
        {item.urlavatar ? (
          <Image source={{ uri: item.urlavatar }} style={styles.avatar} />
        ) : (
          <AvatarUser
            fullName={item.fullname || "Người dùng"}
            width={50}
            height={50}
            avtText={20}
            shadow={false}
            bordered={true}
          />
        )}

        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.fullname || "Người dùng"}</Text>
          {item.phone && <Text style={styles.phone}>{item.phone}</Text>}
        </View>

        <View style={[styles.circle, isSelected && styles.selectedCircle]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
      </TouchableOpacity>
    );
  };

  // Render header với tùy chọn mời qua link
  const renderHeader = () => (
    <View>
      <Text style={styles.subtitle}>Đã chọn: {selectedFriends.length}</Text>

      <TouchableOpacity style={styles.inviteByLinkContainer}>
        <View style={styles.linkIconContainer}>
          <Ionicons name="link-outline" size={24} color={Color.sophy} />
        </View>
        <Text style={styles.inviteByLinkText}>Mời vào nhóm bằng link</Text>
      </TouchableOpacity>
    </View>
  );

  // Render section header (chữ cái)
  const renderSectionHeader = (section) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <OptionHeader title={"Thêm vào nhóm"} />

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm tên hoặc số điện thoại"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Color.sophy} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={groupFriendsByFirstLetter()}
          keyExtractor={(item) => item.title}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <View>
              {renderSectionHeader(item)}
              {item.data.map((friend) => (
                <View key={friend._id}>
                  {renderFriendItem({ item: friend })}
                </View>
              ))}
            </View>
          )}
        />
      )}

      {selectedFriends.length > 0 && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToGroup}
          disabled={isLoading}
        >
          <Text style={styles.addButtonText}>Thêm vào nhóm</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 5,
  },
  titleContainer: {
    marginLeft: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    color: "#666",
    marginTop: 3,
    marginLeft: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 10,
    margin: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  sectionHeader: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    paddingLeft: 16,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "600",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 10,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "500",
  },
  phone: {
    color: "#666",
    marginTop: 2,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCircle: {
    backgroundColor: Color.sophy,
    borderColor: Color.sophy,
  },
  inviteByLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  linkIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e6f3ff",
    justifyContent: "center",
    alignItems: "center",
  },
  inviteByLinkText: {
    marginLeft: 10,
    fontSize: 16,
    color: Color.sophy,
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: Color.sophy,
    margin: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddFriendToGroup;
