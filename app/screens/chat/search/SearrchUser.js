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
import Color from "@/app/components/colors/Color";

const SearchUser = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [friendResults, setFriendResults] = useState([]);
  const [databaseResults, setDatabaseResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allFriends, setAllFriends] = useState([]);

  // Lấy danh sách bạn bè khi chưa tìm kiếm
  useEffect(() => {
    api.getFriends().then((friends) => setAllFriends(friends || []));
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() !== "") {
        setIsSearching(true);
        try {
          // 1. Tìm kiếm trong danh sách bạn bè
          const friends = await api.getFriends();

          // Lọc danh sách bạn bè dựa trên số điện thoại hoặc tên (tìm kiếm tương đối)
          const filteredFriends = friends.filter(
            (friend) =>
              friend.phone?.toString().includes(searchQuery.trim()) ||
              friend.fullname
                ?.toLowerCase()
                .includes(searchQuery.trim().toLowerCase())
          );

          // Cập nhật kết quả tìm kiếm bạn bè
          setFriendResults(filteredFriends);

          // 2. Tìm kiếm chính xác trong database
          try {
            const dbUser = await api.getUserByPhone(searchQuery.trim());
            if (dbUser) {
              const userData = dbUser.data || dbUser;
              const isDuplicate = filteredFriends.some(
                (friend) => friend.userId === userData.userId
              );
              if (!isDuplicate) {
                setDatabaseResults([userData]);
              } else {
                setDatabaseResults([]);
              }
            } else {
              setDatabaseResults([]);
            }
          } catch (error) {
            setDatabaseResults([]);
          }
        } catch (error) {
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
      await navigateToProfile(navigation, contact, {
        showLoading: true,
        onLoadingChange: (loading) => setIsSearching(loading),
      });
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xử lý thông tin người dùng.");
      setIsSearching(false);
    }
  };

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
        <Text style={styles.contactName}>{item.fullname || "Người dùng"}</Text>
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

  // Nếu chưa nhập gì, hiển thị danh sách bạn bè
  const showFriendList = searchQuery.trim() === "";

  return (
    <View style={styles.container}>
      <View style={styles.searchBarBackground}>
        <View style={styles.searchBarRow}>
          {/* Nút back bên trái */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={Color.grayBackgroundButton}
            />
          </TouchableOpacity>
          <View style={styles.searchInputWrapper}>
            <Ionicons
              name="search"
              size={20}
              color={Color.sophy}
              style={styles.searchIconInner}
            />
            <TextInput
              style={styles.searchInputInner}
              placeholder="Nhập số điện thoại hoặc tên"
              placeholderTextColor="#a0a0a0"
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
              autoFocus={true}
            />
          </View>
        </View>
      </View>

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          {showFriendList ? (
            allFriends.length > 0 ? (
              <>{renderSection("Bạn bè", allFriends)}</>
            ) : (
              <Text style={styles.emptyText}>Bạn chưa có bạn bè nào</Text>
            )
          ) : friendResults.length > 0 || databaseResults.length > 0 ? (
            <>
              {renderSection("Bạn bè", friendResults)}
              {renderSection("Người dùng khác", databaseResults)}
            </>
          ) : (
            <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
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
    padding: 0,
  },
  searchBarBackground: {
    backgroundColor: Color.sophy,
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 0,
  },
  backButton: {
    marginLeft: 10,
    marginRight: 4,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginRight: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Color.sophy,
  },
  searchIconInner: {
    marginRight: 6,
    marginLeft: 2,
  },
  searchInputInner: {
    flex: 1,
    height: 40,
    color: "#222",
    fontSize: 16,
    backgroundColor: "transparent",
    borderRadius: 10,
    paddingLeft: 0,
    paddingRight: 0,
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
    paddingHorizontal: 0,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
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
    color: Color.sophy,
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
