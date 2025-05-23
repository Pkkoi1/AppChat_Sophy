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
import OptionHeader from "@/app/features/optionHeader/OptionHeader";
import AntDesign from "@expo/vector-icons/AntDesign";
import Color from "@/app/components/colors/Color";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system"; // Thêm dòng này để đọc file ảnh
import { useFocusEffect } from "@react-navigation/native";

const CreateNewGroup = ({ route, navigation }) => {
  const { userInfo, handlerRefresh } = useContext(AuthContext);

  const { preSelectedFriend } = route.params || {};
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]); // Danh sách bạn bè
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [creatingGroup, setCreatingGroup] = useState(false); // Thêm state này

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

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() !== "") {
        setIsSearching(true);
        try {
          // Lấy danh sách bạn bè
          const friendList = await api.getFriends();

          // Lọc danh sách bạn bè dựa trên số điện thoại hoặc tên (tìm kiếm tương đối)
          const filteredFriends = friendList.filter(
            (friend) =>
              friend.phone?.toString().includes(searchQuery.trim()) ||
              friend.fullname
                ?.toLowerCase()
                .includes(searchQuery.trim().toLowerCase())
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
    let generatedGroupName = groupName;

    if (!groupName.trim()) {
      // Lấy tên của 3 người đầu tiên (không tính người tạo)
      const others = selectedFriends.filter(f => f.userId !== userInfo.userId).slice(0, 3);
      generatedGroupName = others.map(friend => {
        const parts = (friend.fullname || "").trim().split(" ");
        return parts[parts.length - 1] || friend.fullname || "";
      }).join(", ");

      if (!generatedGroupName) {
        Alert.alert("Lỗi", "Vui lòng chọn thành viên.");
        return;
      }
    }

    if (selectedFriends.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một người bạn.");
      return;
    }

    try {
      setIsSearching(true);
      setCreatingGroup(true); // Bắt đầu loading
      // Extract userIds instead of the entire friend object
      const memberIds = selectedFriends.map((friend) => friend.userId);
      const newGroup = await api.createGroupConversation(
        generatedGroupName,
        memberIds
      );

      // Nếu có chọn avatar thì gọi API đổi avatar nhóm
      if (newGroup && groupAvatar) {
        try {
          const base64Image = await FileSystem.readAsStringAsync(groupAvatar, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const imageBase64 = `data:image/jpeg;base64,${base64Image}`;
          await api.changeGroupAvatar(newGroup.conversationId, imageBase64);
        } catch (err) {
          Alert.alert("Lỗi", "Không thể cập nhật ảnh đại diện nhóm.");
        }
      }

      if (newGroup) {
        Alert.alert("Thành công", "Nhóm đã được tạo!");
        navigation.navigate("Home");
        handlerRefresh(); // Refresh the friend list or any other necessary data
      } else {
        Alert.alert("Lỗi", "Không thể tạo nhóm.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Nhóm phải có 2 thành viên trở lên.");
    } finally {
      setIsSearching(false);
      setCreatingGroup(false); // Kết thúc loading
    }
  };

  // Hàm chọn hình ảnh nhóm
  const handlePickGroupAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setGroupAvatar(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không thể chọn ảnh nhóm.");
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
            shadow={false}
            bordered={false}
            style={{ marginRight: 10 }}
          />
        )}
        <Text style={styles.friendName}>{item.fullname || "Người dùng"}</Text>
        <View style={[styles.circle, isSelected && styles.selectedCircle]}>
          {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
      </TouchableOpacity>
    );
  };

  // Xác nhận khi thoát màn hình nếu đã chọn bạn hoặc nhập tên nhóm hoặc chọn avatar
  useFocusEffect(
    React.useCallback(() => {
      const onBeforeRemove = (e) => {
        if (
          selectedFriends.length === 0 &&
          !groupName.trim() &&
          !groupAvatar
        ) {
          // Không có gì để xác nhận, cho phép thoát luôn
          return;
        }
        e.preventDefault();
        Alert.alert(
          "Xác nhận",
          "Bạn có chắc chắn muốn thoát? Thông tin nhóm sẽ không được lưu.",
          [
            { text: "Ở lại", style: "cancel", onPress: () => {} },
            {
              text: "Thoát",
              style: "destructive",
              onPress: () => navigation.dispatch(e.data.action),
            },
          ]
        );
      };

      navigation.addListener("beforeRemove", onBeforeRemove);
      return () => navigation.removeListener("beforeRemove", onBeforeRemove);
    }, [navigation, selectedFriends.length, groupName, groupAvatar])
  );

  return (
    <View style={styles.container}>
      {/* Group Name Input */}
      <OptionHeader title={"Nhóm mới"} />
      <View style={styles.groupNameRow}>
        <TouchableOpacity onPress={handlePickGroupAvatar} activeOpacity={0.7}>
          {groupAvatar ? (
            <Image
              source={{ uri: groupAvatar }}
              style={styles.groupAvatarImage}
            />
          ) : (
            <AntDesign name="camera" size={50} color={Color.gray} />
          )}
        </TouchableOpacity>
        <TextInput
          style={[
            styles.groupNameInput,
            { flex: 1, marginLeft: 12, marginTop: 0, marginBottom: 0 },
          ]}
          placeholder="Nhập tên nhóm"
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

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

      {/* Hiển thị số lượng đã chọn */}
      {selectedFriends.length > 0 && (
        <Text style={styles.selectedCountText}>
          Đã chọn: {selectedFriends.length}
        </Text>
      )}

      {/* Friend List */}
      <FlatList
        data={searchQuery.trim() === "" ? friends : searchResults}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderFriendItem}
        style={{ flex: 1 }}
      />

      {/* Thanh thành viên đã chọn + nút thêm nhóm ở dưới cùng */}
      {selectedFriends.length > 0 && (
        <View style={styles.bottomBar}>
          <FlatList
            data={selectedFriends}
            horizontal
            keyExtractor={(item) => item._id.toString()}
            contentContainerStyle={styles.selectedListBottom}
            renderItem={({ item }) => (
              <View style={styles.selectedUserContainerBottom}>
                {item.urlavatar ? (
                  <Image
                    source={{ uri: item.urlavatar }}
                    style={styles.selectedAvatarBottom}
                  />
                ) : (
                  <AvatarUser
                    fullName={item.fullname || "Người dùng"}
                    width={50}
                    height={50}
                    avtText={14}
                    shadow={false}
                    bordered={false}
                  />
                )}
                <TouchableOpacity
                  style={styles.removeUserButtonBottom}
                  onPress={() =>
                    setSelectedFriends(
                      selectedFriends.filter((f) => f._id !== item._id)
                    )
                  }
                >
                  <AntDesign name="closecircle" size={18} color={Color.gray} />
                </TouchableOpacity>
              </View>
            )}
          />
          <TouchableOpacity
            style={[
              styles.fabCreateGroupRight,
              creatingGroup && { opacity: 0.7 },
            ]}
            onPress={handleCreateGroup}
            disabled={creatingGroup} // Disable khi loading
          >
            {creatingGroup ? (
              <ActivityIndicator size={24} color="#fff" />
            ) : (
              <AntDesign name="arrowright" size={28} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      )}
      {creatingGroup && (
        <View style={styles.loadingOverlay}>
          {/* View phủ toàn màn hình để ngăn thao tác */}
        </View>
      )}
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
  groupNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  groupNameInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 10,
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
  selectedCountText: {
    marginLeft: 18,
    marginBottom: 4,
    color: "#666",
    fontSize: 15,
    fontWeight: "500",
  },
  // Thanh dưới cùng chứa danh sách thành viên đã chọn và nút thêm
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#f3f4f6",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    minHeight: 64,
    // Bóng lớn và đậm hơn
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 18,
  },
  selectedListBottom: {
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
    padding: 5,
  },
  selectedUserContainerBottom: {
    marginRight: 12,
    alignItems: "center",
    position: "relative",
  },
  selectedAvatarBottom: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  removeUserButtonBottom: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#fff",
    borderRadius: 12,
    zIndex: 2,
  },
  fabCreateGroupRight: {
    marginLeft: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Color.sophy,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
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
    backgroundColor: Color.sophy,
    borderColor: Color.sophy,
  },
  fabCreateGroup: {
    position: "absolute",
    left: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Color.sophy,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  createGroupButtonText: {
    color: "white",
    fontSize: 18,
  },
  groupAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#eee",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.1)",
    zIndex: 100,
  },
});

export default CreateNewGroup;
