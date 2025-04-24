import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import Colors from "../../../../components/colors/Color";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { api } from "../../../../api/api";
import { AuthContext } from "../../../../auth/AuthContext";

const GroupOption = ({ conversation, receiver }) => {
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if receiver is a friend when component mounts
    const checkIsFriend = async () => {
      try {
        if (!receiver || !receiver.userId) {
          setIsFriend(false);
          setLoading(false);
          return;
        }
        
        const friends = await api.getFriends();
        const foundFriend = friends.some(friend => friend.userId === receiver.userId);
        setIsFriend(foundFriend);
      } catch (error) {
        console.error("Error checking friendship status:", error);
        setIsFriend(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkIsFriend();
  }, [receiver]);

  const handleCreateGroupWith = () => {
    navigation.navigate("CreateNewGroup", {
      preSelectedFriend: receiver // Pass the receiver as the pre-selected friend
    });
  };

  const handleAddToGroups = () => {
    navigation.navigate("AddFriendToGroups", {
      friend: receiver,
    });
  };
  
  const handleViewSameGroups = () => {
    if (!receiver || !receiver.userId) {
      Alert.alert("Lỗi", "Không thể xác định người dùng để xem nhóm chung");
      return;
    }
    
    navigation.navigate("SameGroups", {
      friend: receiver,
    });
  };

  // Only show friend-specific group options if receiver is a friend
  const friendGroupOptions = isFriend ? [
    {
      name: "Tạo nhóm với ",
      icon: <Ionicons name="people-outline" size={20} color={Colors.gray} />,
      action: handleCreateGroupWith
    },
    {
      name: "Thêm vào nhóm",
      icon: <Ionicons name="person-add-outline" size={20} color={Colors.gray} />,
      action: handleAddToGroups
    },
    {
      name: "Xem nhóm chung",
      icon: <Ionicons name="people-outline" size={20} color={Colors.gray} />,
      action: handleViewSameGroups
    },
  ] : [
    // Only show "View common groups" if not friends
    {
      name: "Xem nhóm chung",
      icon: <Ionicons name="people-outline" size={20} color={Colors.gray} />,
      action: handleViewSameGroups
    },
  ];

  const groupsOption = [
    {
      name: `Xem thành viên (${conversation?.groupMembers?.length || 0})`,
      icon: <Ionicons name="people-outline" size={20} color={Colors.gray} />,
      action: () =>
        navigation.navigate("GroupMember", {
          conversation,
        }),
    },
    {
      name: "Link nhóm",
      icon: <Ionicons name="link-outline" size={20} color={Colors.gray} />,
    },
  ];
  
  if (loading) {
    return null; // Or a loading indicator
  }
  
  return (
    <View style={styles.container}>
      {conversation?.isGroup
        ? groupsOption.map((option, index) => (
            <TouchableOpacity
              style={styles.groupButton}
              key={index}
              onPress={option.action}
            >
              <View style={styles.buttonIcon}>{option.icon}</View>
              <View style={styles.textBorder}>
                <Text style={styles.buttonText}>{option.name}</Text>
              </View>
            </TouchableOpacity>
          ))
        : friendGroupOptions.map((option, index) => (
            <TouchableOpacity 
              style={styles.groupButton} 
              key={index}
              onPress={option.action}
            >
              <View style={styles.buttonIcon}>{option.icon}</View>
              <View style={styles.textBorder}>
                <Text style={styles.buttonText}>
                  {option.name === "Thêm vào nhóm"
                    ? `Thêm ${receiver?.fullname} vào nhóm`
                    : option.name === "Tạo nhóm với "
                    ? `${option.name}${receiver?.fullname}`
                    : option.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 0,
    marginBottom: 10,
  },
  groupButton: {
    backgroundColor: "#fff",
    borderRadius: 5,
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 24,
    paddingTop: 16,
  },
  buttonIcon: {
    marginRight: 20,
    paddingBottom: 10,
  },
  textBorder: {
    borderBottomWidth: 0.4,
    borderBottomColor: "#ddd",
    paddingBottom: 16,
    width: "85%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 15,
  },
});

export default GroupOption;