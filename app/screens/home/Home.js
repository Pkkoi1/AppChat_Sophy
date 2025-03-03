import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Tab, TabView } from "@rneui/themed";
import { AntDesign } from "@expo/vector-icons";
import ListInbox from "../inbox/ListInbox";
import Profile from "../profile/Profile";
import Directory from "../directory/Index";
import Discover from "../discover/Discover";
import Diary from "../diary/Diary";
import HeadView from "../header/Header";
import HomeStyle from "./HomeStyle";

const screens = [
  {
    name: "Inbox",
    component: <ListInbox />,
    icon: "message1",
    title: "Tin nhắn",
  },
  {
    name: "Directory",
    component: <Directory />,
    icon: "contacts",
    title: "Danh bạ",
  },
  {
    name: "Discover",
    component: <Discover />,
    icon: "find",
    title: "Khám phá",
  },
  {
    name: "Diary",
    component: <Diary />,
    icon: "clockcircleo",
    title: "Nhật ký",
  },
  { name: "Profile", component: <Profile />, icon: "user", title: "Cá nhân" },
];

const Home = () => {
  const [index, setIndex] = useState(0);
  const unreadMessages = 3;

  return (
    <View style={HomeStyle.homeContainer}>
      <HeadView page={screens[index].name} />

      <TabView value={index} onChange={setIndex} animationType="spring">
        {screens.map((screen, idx) => (
          <TabView.Item key={idx} style={{ width: "100%" }}>
            {screen.component}
          </TabView.Item>
        ))}
      </TabView>
      <View style={HomeStyle.footer}>
        {screens.map((screen, idx) => (
          <TouchableOpacity
            key={screen.name}
            onPress={() => setIndex(idx)}
            style={{ flex: 1, alignItems: "center" }}
          >
            <AntDesign
              name={screen.icon}
              size={index === idx ? 22 : 20}
              color={index === idx ? "#1b96fd" : "#000"}
            />
            {screen.name === "Inbox" && unreadMessages > 0 && (
              <View style={HomeStyle.badge}>
                <Text style={HomeStyle.badgeText}>{unreadMessages}</Text>
              </View>
            )}
            {index === idx && (
              <Text
                style={[HomeStyle.iconText, { color: "#1b96fd", marginTop: 2 }]}
              >
                {screen.title}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Home;
