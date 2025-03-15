import React, { useState } from "react";
import { FlatList, RefreshControl, View, Image, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Inbox from "./Inbox";
import conversations from "../../../assets/objects/conversation.json";

const ListInbox = ({ userId }) => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const handlerRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  // Filter conversations where any participant's ID matches the userId
  const filteredConversations = conversations.filter((conversation) =>
    conversation.participants.some((participant) => participant.id === userId)
  );

  const renderGroupAvatar = (participants) => {
    let avatarSize = 28; // Kích thước ảnh nhỏ
    let borderWidth = 2; // Viền trắng
    let gap = 18; // Khoảng cách giữa ảnh
    let containerSize = 50; // Kích thước thẻ chứa

    let positions = [
      { left: 0, top: 0 },
      { left: gap, top: 0 },
      { left: 0, top: gap },
      { left: gap, top: gap },
    ];

    let displayedParticipants = participants.slice(0, 4);
    let avatars = displayedParticipants.map((participant, index) => {
      if (index === 3 && participants.length > 4) {
        return (
          <View
            key={index}
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              backgroundColor: "#ccc",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              ...positions[index],
              borderWidth: borderWidth,
              borderColor: "#fff",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
              +{participants.length - 3}
            </Text>
          </View>
        );
      }

      return (
        <Image
          key={index}
          source={{ uri: participant.avatar }}
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            position: "absolute",
            ...positions[index],
            borderWidth: borderWidth,
            borderColor: "#fff",
          }}
        />
      );
    });

    return (
      <View
        style={{
          width: containerSize,
          height: containerSize,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        {avatars}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, width: "100%" }}>
      <FlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handlerRefresh} />
        }
        data={filteredConversations}
        keyExtractor={(item) => item.conversation_id.toString()} // Ensure conversation_id is a string
        renderItem={({ item }) => {
          const lastMessage = item.messages[item.messages.length - 1];
          const otherParticipant = item.participants.find(
            (p) => p.id !== userId
          ) || { name: "Unknown", avatar: null }; // Default value if otherParticipant is null

          let avatar;
          if (item.isGroup) {
            avatar = item.groupAvatar
              ? { uri: item.groupAvatar }
              : renderGroupAvatar(item.participants);
          } else {
            avatar =
              otherParticipant.avatar ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbHfn_ap7TA8_f2b-QWEdQWRTtlI8U5strBQ&s";
          }

          return (
            <Inbox
              name={item.isGroup ? item.groupName : otherParticipant.name}
              avatar={avatar} // Pass avatar to Inbox
              message={lastMessage.content}
              date={lastMessage.timestamp}
              conversation_id={item.conversation_id}
              user_id={userId} // Pass user_id to Inbox
              groupName={item.groupName}
            />
          );
        }}
      />
    </View>
  );
};

export default ListInbox;
