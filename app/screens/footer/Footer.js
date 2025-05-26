import React, { use, useContext, useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import FooterStyle from "./FooterStyle";
import { SocketContext } from "@/app/socket/SocketContext";
import { AuthContext } from "@/app/auth/AuthContext";

export const footerItem = [
  {
    name: "message1",
    filledName: "message1",
    title: "Tin nhắn",
    screen: "Inbox",
  },
  {
    name: "contacts",
    filledName: "contacts",
    title: "Danh bạ",
    screen: "Directory",
  },
  { name: "find", filledName: "find", title: "Khám phá", screen: "Discover" },
  {
    name: "clockcircleo",
    filledName: "clockcircle",
    title: "Nhật ký",
    screen: "Diary",
  },
  { name: "user", filledName: "user", title: "Cá nhân", screen: "Profile" },
];

const Footer = ({ setCurrentScreen }) => {
  const initialScreen = footerItem[0].screen;
  const [selectedIcon, setSelectedIcon] = useState(initialScreen);
  const [unreadMessages, setUnreadMessages] = useState(0); // Số lượng tin nhắn chưa đọc
  const { socket } = useContext(SocketContext); // Use SocketContext
  const { userInfo, conversations, unreadConversation } =
    useContext(AuthContext); // Lấy conversations từ AuthContext
  const [animations, setAnimations] = useState(
    footerItem.reduce((acc, item) => {
      acc[item.name] = new Animated.Value(1);
      return acc;
    }, {})
  );

  useEffect(() => {
    setCurrentScreen(initialScreen); // Cập nhật màn hình cha ngay từ đầu
  }, []);

  useEffect(() => {
    // Lắng nghe sự kiện từ socket
    const handleNewMessage = (data) => {
      if (data && data.conversationId) {
        // Cập nhật số lượng tin nhắn chưa đọc
        setUnreadMessages((prevCount) => prevCount + 1);
      }
      console.log("New message received at footer:", data);
    };

    socket.on("newMessage", handleNewMessage);

    // Dọn dẹp khi component unmount
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket]);

  useEffect(() => {
    // Tính số lượng cuộc trò chuyện chưa đọc
    if (conversations && userInfo) {
      const unreadCount = conversations.reduce((count, conversation) => {
        if (
          conversation.unreadCount &&
          conversation.unreadCount.includes(userInfo.userId)
        ) {
          return count + 1;
        }
        return count;
      }, 0);
      setUnreadMessages(unreadCount);
    }
  }, [conversations, userInfo]);

  const handlePress = (item) => {
    if (!item.screen) return;

    setSelectedIcon(item.screen);
    setCurrentScreen(item.screen);

    Animated.sequence([
      Animated.timing(animations[item.name], {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animations[item.name], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <SafeAreaView style={FooterStyle.footer}>
      <View style={FooterStyle.iconContainer}>
        {footerItem.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => handlePress(item)}>
            <Animated.View
              style={[
                FooterStyle.iconWrapper,
                { transform: [{ scale: animations[item.name] || 1 }] },
              ]}
            >
              <View style={{ position: "relative" }}>
                <AntDesign
                  name={
                    selectedIcon === item.screen ? item.filledName : item.name
                  }
                  size={selectedIcon === item.screen ? 22 : 20}
                  color={selectedIcon === item.screen ? "#1b96fd" : "#000"}
                />

                {item.screen === "Inbox" && unreadMessages > 0 && (
                  <View style={FooterStyle.badge}>
                    <Text style={FooterStyle.badgeText}>{unreadMessages}</Text>
                  </View>
                )}
              </View>

              {selectedIcon === item.screen && (
                <Text style={FooterStyle.iconText}>{item.title}</Text>
              )}
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default Footer;
