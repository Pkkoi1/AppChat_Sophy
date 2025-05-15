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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../api/api";
import AvatarUser from "@/app/components/profile/AvatarUser";
import { navigateToProfile } from "@/app/utils/profileNavigation";

const SearchUser = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [friendResults, setFriendResults] = useState([]);
  const [databaseResults, setDatabaseResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() !== "") {
        setIsSearching(true);
        try {
          // 1. Tìm kiếm trong danh sách bạn bè
          const friends = await api.getFriends();
          
          // Lọc danh sách bạn bè dựa trên số điện thoại hoặc tên (tìm kiếm tương đối)
          const filteredFriends = friends.filter((friend) =>
            (friend.phone?.toString().includes(searchQuery.trim())) || 
            (friend.fullname?.toLowerCase().includes(searchQuery.trim().toLowerCase()))
          );
  
          // Cập nhật kết quả tìm kiếm bạn bè
          setFriendResults(filteredFriends);
  
          // 2. Tìm kiếm chính xác trong database
          try {
            console.log("Tìm kiếm trong database với số điện thoại:", searchQuery.trim());
            const dbUser = await api.getUserByPhone(searchQuery.trim());
            
            console.log("Kết quả tìm kiếm từ database:", dbUser);
            
            if (dbUser) {
              // Xác định dữ liệu người dùng (có thể là trực tiếp hoặc trong .data)
              const userData = dbUser.data || dbUser;
              
              // Kiểm tra xem user đã có trong danh sách bạn bè chưa
              const isDuplicate = filteredFriends.some(
                friend => friend.userId === userData.userId
              );
              
              console.log("Trùng lặp với bạn bè?", isDuplicate);
              console.log("User data:", userData);
              
              if (!isDuplicate) {
                setDatabaseResults([userData]);
              } else {
                setDatabaseResults([]);
              }
            } else {
              setDatabaseResults([]);
            }
          } catch (error) {
            console.log("Không tìm thấy user trong database:", error);
            setDatabaseResults([]);
          }
        } catch (error) {
          console.error("Lỗi khi tìm kiếm:", error);
          setFriendResults([]);
          setDatabaseResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setFriendResults([]);
        setDatabaseResults([]);
      }
    }, 500);
  
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleContactClick = async (contact) => {
    try {
      setIsSearching(true);
      // Just call the utility function with the user object
      // No need to manually determine friend status
      await navigateToProfile(navigation, contact, {
        showLoading: true,
        onLoadingChange: (loading) => setIsSearching(loading)
      });
    } catch (error) {
      console.error("Error in handleContactClick:", error);
      Alert.alert("Lỗi", "Không thể xử lý thông tin người dùng.");
      setIsSearching(false);
    }
  };

  // Kết hợp kết quả tìm kiếm từ bạn bè và database
  const allResults = [
    ...friendResults.map(item => ({ ...item, isFriend: true })),
    ...databaseResults.map(item => ({ ...item, isFriend: false }))
  ];

  // Render một item trong danh sách kết quả
  const renderResultItem = ({ item }) => (
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
        />
      )}
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>
          {item.fullname || "Người dùng"}
        </Text>
        <Text style={styles.contactPhone}>{item.phone}</Text>
      </View>
      {item.isFriend && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Bạn bè</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render section headers
  const renderSectionHeader = (title) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  // Render section items
  const renderSection = (title, data) => {
    if (data.length === 0) return null;
    
    return (
      <View key={title}>
        {renderSectionHeader(title)}
        {data.map((item, index) => (
          <View key={item._id || item.userId || `item-${index}`}>
            {renderResultItem({ item })}
          </View>
        ))}
      </View>
    );
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
          placeholder="Nhập số điện thoại hoặc tên"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          autoFocus={true}
        />
      </View>
      
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          {friendResults.length > 0 || databaseResults.length > 0 ? (
            <>
              {renderSection("Bạn bè", friendResults)}
              {renderSection("Người dùng khác", databaseResults)}
            </>
          ) : (
            searchQuery.trim() !== "" && (
              <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
            )
          )}
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  resultsContainer: {
    flex: 1,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
  },
  contactPhone: {
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#0078d7",
    fontSize: 12,
    fontWeight: "500",
  },
  sectionHeader: {
    backgroundColor: "#f5f5f5",
    padding: 8,
    paddingHorizontal: 12,
  },
  sectionHeaderText: {
    fontWeight: "600",
    color: "#555",
  },
});

export default SearchUser;