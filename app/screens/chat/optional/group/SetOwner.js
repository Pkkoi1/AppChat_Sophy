import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { api } from "@/app/api/api";

const SetOwner = ({ conversation, navigation }) => {
  const [groupMembers, setGroupMembers] = useState(
    conversation.groupMembers || []
  );
  const [loading, setLoading] = useState(false);

  const handleSetOwner = async (newOwnerId) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn chuyển quyền nhóm trưởng cho thành viên này không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              setLoading(true);
              await api.promoteToOwner(conversation.conversationId, newOwnerId);
              Alert.alert("Thành công", "Quyền nhóm trưởng đã được chuyển.");
              navigation.goBack(); // Navigate back after setting the new owner
            } catch (error) {
              Alert.alert(
                "Lỗi",
                "Không thể chuyển quyền nhóm trưởng. Vui lòng thử lại sau."
              );
              console.error("Lỗi khi chuyển quyền nhóm trưởng:", error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderMember = ({ item }) => (
    <TouchableOpacity
      style={styles.memberItem}
      onPress={() => handleSetOwner(item.userId)}
    >
      <Text style={styles.memberName}>{item.fullname || "Không rõ"}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn thành viên để làm nhóm trưởng</Text>
      <FlatList
        data={groupMembers}
        keyExtractor={(item) => item.userId}
        renderItem={renderMember}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  memberItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  memberName: {
    fontSize: 16,
    color: "#000",
  },
});

export default SetOwner;
