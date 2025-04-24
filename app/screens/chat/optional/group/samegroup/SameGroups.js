import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { api } from "../../../../../api/api";
import { Ionicons } from "@expo/vector-icons";
import Color from "../../../../../components/colors/Color";
import { useNavigation } from "@react-navigation/native";
import RenderGroupAvatar from "../../../../../components/group/RenderGroupAvatar";

const SameGroups = ({ route }) => {
  const { friend } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchSameGroups();
  }, []);

  // Add handlers for the two top buttons
  const handleCreateGroupWith = () => {
    navigation.navigate("CreateNewGroup", {
      preSelectedFriend: friend // Pass the friend as the pre-selected friend
    });
  };

  const handleAddToGroups = () => {
    navigation.navigate("AddFriendToGroups", {
      friend: friend,
    });
  };

  const fetchSameGroups = async () => {
    try {
      setLoading(true);
      const data = await api.getSameGroups(friend.userId);
      setGroups(data);
    } catch (error) {
      console.error("Error fetching common groups:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách nhóm chung");
    } finally {
      setLoading(false);
    }
  };

  const handleGroupPress = (conversation) => {
    navigation.navigate("Chat", { conversation });
  };

  const renderGroup = ({ item }) => {
    // Existing render code...
    return (
      <TouchableOpacity
        style={styles.groupItem}
        onPress={() => handleGroupPress(item)}
      >
        {item.groupAvatarUrl ? (
          <Image source={{ uri: item.groupAvatarUrl }} style={styles.avatar} />
        ) : (
          <RenderGroupAvatar members={item.groupMembers} />
        )}
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>
            {item.groupName || "Nhóm không tên"}
          </Text>
          <Text style={styles.memberCount}>
            {item.groupMembers?.length || 0} thành viên
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Nhóm chung với {friend?.fullname}
        </Text>
      </View>

      {/* Add the two action buttons at the top */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCreateGroupWith}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="people-outline" size={24} color={Color.blue} />
          </View>
          <Text style={styles.actionText}>
            Tạo nhóm với {friend?.fullname}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleAddToGroups}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="person-add-outline" size={24} color={Color.blue} />
          </View>
          <Text style={styles.actionText}>
            Thêm {friend?.fullname} vào nhóm
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Color.sophy}
          style={styles.loader}
        />
      ) : groups.length > 0 ? (
        <FlatList
          data={groups}
          renderItem={renderGroup}
          keyExtractor={(item) => item.conversationId}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={60} color={Color.gray} />
          <Text style={styles.emptyText}>
            Không có nhóm chung nào với {friend?.fullname}
          </Text>
        </View>
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
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  // Add styles for the action buttons
  actionContainer: {
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e6f2ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    color: "#333",
  },
  loader: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  // Existing styles remain unchanged
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  groupInfo: {
    flex: 1,
    marginLeft: 10,

  },
  groupName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 14,
    color: Color.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Color.gray,
    textAlign: "center",
    marginTop: 16,
  },
});

export default SameGroups;