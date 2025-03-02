import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Animated } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import FooterStyle from "./FooterStyle";

export const footerItem = [
  {
    name: "message1",
    filledName: "message1",
    title: "Tin nhắn",
    screen: "Inbox",
  },
  { name: "contacts", filledName: "contacts", title: "Danh bạ", screen: "Directory" },
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
  const route = useRoute();

  // 🔥 Lấy màn hình đầu tiên trong danh sách footerItem
  const initialScreen = footerItem[0].screen;
  const [selectedIcon, setSelectedIcon] = useState(initialScreen);
  const [unreadMessages, setUnreadMessages] = useState(3);

  const [animations, setAnimations] = useState(
    footerItem.reduce((acc, item) => {
      acc[item.name] = new Animated.Value(1);
      return acc;
    }, {})
  );

  useEffect(() => {
    if (route.name) {
      setSelectedIcon(route.name);
    } else {
      setSelectedIcon(initialScreen); // 🔥 Nếu route không có, chọn mặc định
    }
  }, [route.name]);

  useEffect(() => {
    setCurrentScreen(initialScreen); // 🔥 Cập nhật màn hình cha ngay từ đầu
  }, []);

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
    <View style={FooterStyle.footer}>
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
                  size={selectedIcon === item.screen ? 28 : 24}
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
    </View>
  );
};

export default Footer;
