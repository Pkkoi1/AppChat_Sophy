import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Animated } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import FooterStyle from "./FooterStyle";

const footerItem = [
  { name: "message1", filledName: "message1", title: "Tin nhắn", screen: "Home" },
  { name: "contacts", filledName: "contacts", title: "Danh bạ", screen: null },
  { name: "find", filledName: "find", title: "Khám phá", screen: null },
  { name: "clockcircleo", filledName: "clockcircle", title: "Nhật ký", screen: null },
  { name: "user", filledName: "user", title: "Cá nhân", screen: "Chat" },
];

const Footer = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [selectedIcon, setSelectedIcon] = useState(route.name);
  const [unreadMessages, setUnreadMessages] = useState(3); // 🔹 Số lượng tin nhắn chưa đọc mặc định
  const [animations, setAnimations] = useState(
    footerItem.reduce((acc, item) => {
      acc[item.name] = new Animated.Value(1);
      return acc;
    }, {})
  );

  useEffect(() => {
    setSelectedIcon(route.name);
  }, [route.name]);

  const handlePress = (item) => {
    if (!animations[item.name]) return;

    setSelectedIcon(item.screen);

    if (item.screen) {
      navigation.navigate(item.screen);
    }

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
                  name={selectedIcon === item.screen ? item.filledName : item.name}
                  size={selectedIcon === item.screen ? 28 : 24}
                  color={selectedIcon === item.screen ? "#1b96fd" : "#000"}
                />
                
                {/* 🔹 Badge hiển thị số lượng tin nhắn chưa đọc */}
                {item.screen === "Home" && unreadMessages > 0 && (
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
