import React from "react";
import { Text, View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";

const Inbox = ({
  name,
  avatar,
  message,
  date,
  conversation_id,
  user_id,
  groupName,
}) => {
  const navigation = useNavigation();

  const getTimeDifference = (date) => {
    const now = moment();
    const messageDate = moment(date);
    const diffInSeconds = now.diff(messageDate, "seconds");
    const diffInMinutes = now.diff(messageDate, "minutes");
    const diffInHours = now.diff(messageDate, "hours");
    const diffInDays = now.diff(messageDate, "days");

    if (diffInSeconds < 60) {
      return `${diffInSeconds} giây trước`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      return messageDate.format("DD/MM/YY");
    }
  };

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Chat", {
          conversation_id: conversation_id, // Truyền conversation_id vào params
          user_id: user_id, // Truyền user_id vào params
        })
      }
      activeOpacity={0.6}
      style={styles.container}
    >
      <View style={styles.avatarContainer}>
        {typeof avatar === "string" ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          avatar
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          {groupName || name}
        </Text>
        <Text style={{ color: "gray" }}>{message}</Text>
      </View>
      <Text style={{ color: "gray" }}>{getTimeDifference(date)}</Text>
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
});

export default Inbox;
