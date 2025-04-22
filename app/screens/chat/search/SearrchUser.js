import React, { useState, useEffect } from "react";
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
import { api } from "../../../api/api";
import AvatarUser from "@/app/components/profile/AvatarUser";

const SearchUser = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() !== "") {
        setIsSearching(true);
        try {
          // Lấy danh sách bạn bè
          const friends = await api.getFriends();
          
          // Lọc danh sách bạn bè dựa trên số điện thoại (tìm kiếm tương đối)
          const filteredFriends = friends.filter((friend) =>
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

  const handleContactClick = async (contact) => {
    try {
      setIsSearching(true);
  
      // Gọi API để lấy thông tin bạn bè, lời mời đã gửi và đã nhận
      const friends = await api.getFriends();
      const isFriend = friends.some((f) => f._id === contact._id);
  
      let requestSent = "";
      if (isFriend) {
        requestSent = "friend";
      } else {
        const sentRequests = await api.getFriendRequestsSent();
        const isRequestSent = sentRequests.some(
          (sentRequest) => sentRequest.receiverId._id === contact._id
        );
  
        if (isRequestSent) {
          requestSent = "pending";
        } else {
          const receivedRequests = await api.getFriendRequestsReceived();
          const isRequestReceived = receivedRequests.some(
            (req) => req.senderId._id === contact._id
          );
  
          if (isRequestReceived) {
            requestSent = "accepted";
          }
        }
      }
  
      // Điều hướng đến màn hình UserProfile với thông tin bạn bè và trạng thái
      navigation.navigate("UserProfile", {
        friend: contact,
        requestSent,
      });
    } catch (error) {
      console.error("Lỗi khi xử lý contact:", error);
      Alert.alert("Lỗi", "Không thể xử lý thông tin người dùng.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Nhập số điện thoại"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          autoFocus={true}
          keyboardType="phone-pad"
        />
      </View>
      {isSearching ? (
        <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.contactItem}
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
                  style={styles.avatar}
                />
              )}
              <Text style={styles.contactName}>
                {item.fullname || "Người dùng"}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            searchQuery.trim() !== "" && (
              <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  loadingText: {
    textAlign: "center",
    color: "#888",
    marginTop: 10,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 10,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  contactName: {
    fontSize: 16,
  },
});

export default SearchUser;