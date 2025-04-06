import React, { useEffect, useState } from "react";
import { Text, View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
import AvatarUser from "@/app/components/profile/AvatarUser";

const Inbox = ({
  name,
  avatar,
  message,
  date,
  conversation_id,
  user_id,
  groupName,
  receiverId,
}) => {
  const navigation = useNavigation();
  const [receiver, setReceiver] = useState({});

  const getTimeDifference = (date) => {
    const validDate = moment(new Date(date)); // Chuyển đổi date thành đối tượng Date hợp lệ
    if (!validDate.isValid()) {
      return "Ngày không hợp lệ";
    }

    const now = moment();
    const diffInSeconds = now.diff(validDate, "seconds");
    const diffInMinutes = now.diff(validDate, "minutes");
    const diffInHours = now.diff(validDate, "hours");
    const diffInDays = now.diff(validDate, "days");

    if (diffInSeconds < 60) {
      return `${diffInSeconds} giây trước`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      return validDate.format("DD/MM/YY");
    }
  };

  const truncateMessage = (message, maxLength) => {
    if (message.length > maxLength) {
      return message.substring(0, maxLength) + "...";
    }
    return message;
  };

  useEffect(() => {
    const getUserInfo = async () => {
      if (!groupName) {
        // Chỉ gọi fetchUserInfo nếu groupName là null hoặc rỗng
        const data = await fetchUserInfo(receiverId);
        setReceiver(data);
      }
    };

    getUserInfo();
  }, [receiverId, groupName]);

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Chat", {
          conversation_id: conversation_id, // Truyền conversation_id vào params
          user_id: user_id, // Truyền user_id vào params
          receiverId: receiverId, // Truyền receiverId vào params
        })
      }
      activeOpacity={0.6}
      style={styles.container}
    >
      <View style={styles.avatarContainer}>
        {avatar && avatar.uri && avatar.uri !== "null" ? (
          <Image source={{ uri: avatar.uri }} style={styles.avatar} />
        ) : (
          <AvatarUser
            fullName={receiver?.fullname || name}
            width={50}
            height={50}
            avtText={20}
            shadow={false}
            bordered={false}
          />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.name}>{groupName || receiver?.fullname}</Text>
          <Text style={styles.time}>{getTimeDifference(date)}</Text>
        </View>
        <Text style={styles.message} numberOfLines={1} ellipsizeMode="tail">
          {truncateMessage(message, 50)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    paddingLeft: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    backgroundColor: "white",
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  time: {
    color: "gray",
    fontSize: 12,
  },
  message: {
    color: "gray",
    fontSize: 14,
    marginTop: 4,
    maxWidth: "90%", // Giới hạn chiều rộng của tin nhắn
  },
});

export default Inbox;
