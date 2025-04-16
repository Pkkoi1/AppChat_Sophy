import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons'; 
import FriendStyle from "./FriendStyle";

const Friends = ({ friend, showInviteButton, onInvite }) => {
  // Tạo chữ cái đầu tên để hiển thị avatar khi không có ảnh
  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const avatarInitial = getInitials(friend.fullname);
  
  // Tạo màu ngẫu nhiên nhưng cố định cho mỗi người dùng
  const getAvatarColor = (name) => {
    if (!name) return "#ccc";
    const colors = [
      "#4CAF50", "#2196F3", "#FFC107", "#E91E63", 
      "#9C27B0", "#3F51B5", "#009688", "#FF5722"
    ];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  const avatarColor = getAvatarColor(friend.fullname);
  
  return (
    <View style={styles.container}>
      {/* Avatar */}
      {friend.urlavatar ? (
        <Image
          source={{ uri: friend.urlavatar }}
          style={styles.avatar}
        />
      ) : friend.imageUri ? (
        <Image
          source={{ uri: friend.imageUri }}
          style={styles.avatar}
        />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{avatarInitial}</Text>
        </View>
      )}
      
      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {friend.fullname}
        </Text>
        
        {friend.isPhoneContact && (
          <View style={styles.statusContainer}>
            <Text style={styles.phone} numberOfLines={1} ellipsizeMode="tail">
              {friend.phone}
            </Text>
            
            {friend.isAppUser && (
              <View style={styles.appUserBadge}>
                <Text style={styles.appUserText}>Đã dùng app</Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      {/* Actions */}
      <View style={styles.actions}>
        {showInviteButton ? (
          <TouchableOpacity 
            style={styles.inviteButton}
            onPress={onInvite}
          >
            <Text style={styles.inviteText}>Mời</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={FriendStyle.friendActionItem}>
              <AntDesign name="phone" size={19} color="grey" />
            </TouchableOpacity>
            <TouchableOpacity style={FriendStyle.friendActionItem}>
              <AntDesign name="videocamera" size={19} color="grey" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  info: {
    marginLeft: 10,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  phone: {
    fontSize: 14,
    color: "#666",
  },
  appUserBadge: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  appUserText: {
    fontSize: 10,
    color: "#1877F2",
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  inviteButton: {
    backgroundColor: "#1877F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  inviteText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default Friends;
