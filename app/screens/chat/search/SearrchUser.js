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

const SearchUser = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() !== "") {
        setIsSearching(true);
        try {
          const phoneNumber = searchQuery.trim();
          const result = await api.getUserByPhone(phoneNumber);
          if (result) {
            setSearchResults([result]); // Hiển thị kết quả tìm kiếm
          } else {
            setSearchResults([]); // Không tìm thấy người dùng
          }
        } catch (error) {
          console.error("Lỗi khi tìm kiếm người dùng:", error);
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
    navigation.navigate("UserProfile", { friend: contact });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
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
              <Image source={{ uri: item.urlavatar || "https://via.placeholder.com/50" }} style={styles.avatar} />
              <Text style={styles.contactName}>{item.fullname || "Người dùng"}</Text>
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