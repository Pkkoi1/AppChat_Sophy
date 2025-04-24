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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../../api/api";
import AvatarUser from "@/app/components/profile/AvatarUser";
import { AuthContext } from "@/app/auth/AuthContext";

const CreateNewGroup = ({ route, navigation }) => {
  const { userInfo, handlerRefresh } = useContext(AuthContext);

  const { preSelectedFriend } = route.params || {};
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]); // Danh sách bạn bè
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friendList = await api.getFriends();
        setFriends(friendList);

        // If a pre-selected friend was passed, add them to selectedFriends
        if (preSelectedFriend) {
          // Check if the pre-selected friend is in the friend list
          const foundFriend = friendList.find(
            (friend) => friend.userId === preSelectedFriend.userId
          );
          if (foundFriend) {
            setSelectedFriends([foundFriend]);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè:", error);
        Alert.alert("Lỗi", "Không thể tải danh sách bạn bè.");
      }
    };

    loadFriends();
  }, [preSelectedFriend]);

  // Rest of the component remains unchanged

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() !== "") {
        setIsSearching(true);
        try {
          // Lấy danh sách bạn bè
          const friendList = await api.getFriends();

          // Lọc danh sách bạn bè dựa trên số điện thoại (tìm kiếm tương đối)
          const filteredFriends = friendList.filter((friend) =>
            friend.phone?.toString().includes(searchQuery.trim())
          );

          // Cập nhật kết quả tìm kiếm
          setSearchResults(filteredFriends);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách bạn bè:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]); // Xóa kết quả khi không có input
      }
    }, 500); // Thời gian debounce 500ms

    return () => clearTimeout(delayDebounceFn); // Xóa timeout khi searchQuery thay đổi
  }, [searchQuery]);

  const handleContactClick = (contact) => {
    // Toggle selection
    if (selectedFriends.some((friend) => friend._id === contact._id)) {
      setSelectedFriends(
        selectedFriends.filter((friend) => friend._id !== contact._id)
      );
    } else {
      setSelectedFriends([...selectedFriends, contact]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên nhóm.");
      return;
    }

    if (selectedFriends.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một người bạn.");
      return;
    }

    try {
      setIsSearching(true);
      // Extract userIds instead of the entire friend object
      const memberIds = selectedFriends.map((friend) => friend.userId);
      const newGroup = await api.createGroupConversation(groupName, memberIds);

      if (newGroup) {
        Alert.alert("Thành công", "Nhóm đã được tạo!");
        navigation.navigate("Home");
        handlerRefresh(); // Refresh the friend list or any other necessary data
      } else {
        Alert.alert("Lỗi", "Không thể tạo nhóm.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo nhóm:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tạo nhóm.");
    } finally {
      setIsSearching(false);
    }
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
            width={40}
            height={40}
            avtText={16}
          />
        )}
        <Text style={styles.friendName}>{item.fullname || "Người dùng"}</Text>
        <View style={[styles.circle, isSelected && styles.selectedCircle]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Group Name Input */}
      <TextInput
        style={styles.groupNameInput}
        placeholder="Nhập tên nhóm"
        value={groupName}
        onChangeText={setGroupName}
      />

      {/* Search Bar */}
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
          onChangeText={(text) => setSearchQuery(text)}
          keyboardType="default"
        />
      </View>

      {/* Friend List */}
      <FlatList
        data={searchQuery.trim() === "" ? friends : searchResults}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderFriendItem}
        ListHeaderComponent={() => (
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.headerButton}>
              <Text style={styles.headerButtonText}>GẦN ĐÂY</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Text style={styles.headerButtonText}>DANH BẠ</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Create Group Button */}
      <TouchableOpacity
        style={styles.createGroupButton}
        onPress={handleCreateGroup}
      >
        <Text style={styles.createGroupButtonText}>Tạo Nhóm</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles remain unchanged

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  groupNameInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginHorizontal: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerButton: {
    paddingHorizontal: 20,
  },
  headerButtonText: {
    fontSize: 16,
    color: "#007bff",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  friendName: {
    fontSize: 16,
    flex: 1,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "gray",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCircle: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  createGroupButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    marginHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  createGroupButtonText: {
    color: "white",
    fontSize: 18,
  },
});

export default CreateNewGroup;
