import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../../api/api";
import AvatarUser from "@/app/components/profile/AvatarUser";
import { AuthContext } from "@/app/auth/AuthContext";
import RenderGroupAvatar from "@/app/components/group/RenderGroupAvatar";

const AddFriendToGroups = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const { groups, groupsLoading, fetchGroups } = useContext(AuthContext);
  const maxSelections = 5;
  const { friend } = route.params;

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter(group =>
        group.groupName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGroups(filtered);
    }
  }, [searchQuery, groups]);

  const toggleGroupSelection = (group) => {
    if (selectedGroups.some(g => g.conversationId === group.conversationId)) {
      setSelectedGroups(selectedGroups.filter(g => g.conversationId !== group.conversationId));
    } else {
      if (selectedGroups.length < maxSelections) {
        setSelectedGroups([...selectedGroups, group]);
      }
    }
  };



  const handleAddToGroups = async () => {
    if (selectedGroups.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất một nhóm");
      return;
    }

    try {
      for (const group of selectedGroups) {
        await api.addUserToGroup(group.conversationId, friend.userId);
      }
      Alert.alert(
        "Thành công",
        `Đã thêm ${friend.fullname} vào ${selectedGroups.length} nhóm`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Lỗi khi thêm vào nhóm:", error);
      Alert.alert("Lỗi", "Không thể thêm người dùng vào nhóm đã chọn");
    }
  };

  const renderGroupItem = ({ item }) => {
    const isSelected = selectedGroups.some(g => g.conversationId === item.conversationId);

    return (
      <TouchableOpacity
        style={styles.groupItem}
        onPress={() => toggleGroupSelection(item)}
        key={item.conversationId}
      >
        <View style={styles.avatarContainer}>
          {item.groupAvatarUrl ? (
            <Image source={{ uri: item.groupAvatarUrl }} style={styles.groupAvatar} />
          ) : (
            <RenderGroupAvatar members={item.groupMembers} width={50} height={50} avtText={20}/>
          )}
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName} numberOfLines={1}>{item.groupName}</Text>
        </View>
        <View style={[styles.selectionCircle, isSelected && styles.selectedCircle]} />
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <TouchableOpacity
      style={styles.createGroupOption}
      onPress={() => {
        navigation.navigate("CreateNewGroup", { preSelectedFriend: friend });
      }}
    >
      <View style={styles.createGroupIcon}>
        <Ionicons name="person-add" size={24} color="#1e90ff" />
      </View>
      <Text style={styles.createGroupText}>Tạo nhóm với {friend.fullname}</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>Nhóm trò chuyện</Text>
      <TouchableOpacity style={styles.sortButton}>
        <Ionicons name="filter-outline" size={18} color="#666" />
        <Text style={styles.sortText}>Sắp xếp</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Thêm vào nhóm</Text>
          <Text style={styles.subtitle}>
            Đã chọn: {selectedGroups.length}/{maxSelections}
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Nhập tên nhóm"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {groupsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          keyExtractor={(item) => item.conversationId}
          ListHeaderComponent={
            <>
              {renderHeader()}
              {renderSectionHeader()}
            </>
          }
          renderItem={renderGroupItem}
        />
      )}
      <TouchableOpacity style={styles.addButton} onPress={handleAddToGroups}>
        <Text style={styles.addButtonText}>Thêm bạn vào nhóm</Text>
      </TouchableOpacity>
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
  createGroupOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  createGroupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e6f3ff",
    justifyContent: "center",
    alignItems: "center",
  },
  createGroupText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#1e90ff",
    fontWeight: "500",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f5f5f5",
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  groupAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  groupAvatarText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "500",
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  selectedCircle: {
    backgroundColor: "#fff",
    borderColor: "#1e90ff",
    borderWidth: 6,
  },
  addButton: {
    backgroundColor: "#1e90ff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    margin: 10,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default AddFriendToGroups;