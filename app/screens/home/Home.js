import React, { useState, useEffect, useContext } from "react";
import { View } from "react-native";
import { TabView } from "@rneui/themed";
import ListInbox from "../inbox/ListInbox";
import Profile from "../profile/Profile";
import Directory from "../directory/Index";
import Discover from "../discover/Discover";
import Diary from "../diary/Diary";
import HeadView from "../header/Header";
import Footer from "../footer/Footer";
import HomeStyle from "./HomeStyle";
import { AuthContext } from "../../auth/AuthContext"; // Import useAuth hook
import Loading from "@/app/components/loading/Loading";
import { SocketContext } from "@/app/socket/SocketContext";

const Home = ({ route }) => {
  const socket = useContext(SocketContext); // Use SocketContext
  const { userInfo, handlerRefresh, addConversation } = useContext(AuthContext);

  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const screens = [
    {
      name: "Inbox",
      component: <ListInbox userId={userInfo?.userId} />,
      icon: "message1",
      title: "Tin nhắn",
    },
    {
      name: "Directory",
      component: <Directory userId={userInfo?.userId} />,
      icon: "contacts",
      title: "Danh bạ",
    },
    {
      name: "Discover",
      component: <Discover userId={userInfo?.userId} />,
      icon: "find",
      title: "Khám phá",
    },
    {
      name: "Diary",
      component: <Diary userId={userInfo?.userId} />,
      icon: "clockcircleo",
      title: "Nhật ký",
    },
    {
      name: "Profile",
      component: <Profile userInfo={userInfo} />,
      icon: "user",
      title: "Cá nhân",
    },
  ];

  const setCurrentScreen = (screenName) => {
    const screenIndex = screens.findIndex(
      (screen) => screen.name === screenName
    );
    if (screenIndex !== -1) {
      setIndex(screenIndex);
    }
  };

  useEffect(() => {
    if (socket) {
      const handleNewMessage = async () => {
        console.log(
          "New message received. Refreshing conversations at Home..."
        );
        await handlerRefresh();
      };

      const handleGroupDeleted = async () => {
        console.log("Group deleted. Refreshing conversations...");
        await handlerRefresh();
      };

      const handleAvatarChange = async ({ conversationId, newAvatar }) => {
        console.log(
          `Avatar changed for conversation ${conversationId}. Refreshing...`
        );
        // await handlerRefresh();
      };

      socket.on("newMessage", handleNewMessage);
      socket.on("groupDeleted", handleGroupDeleted);
      socket.on("groupAvatarChanged", handleAvatarChange);

      return () => {
        socket.off("newMessage", handleNewMessage);
        socket.off("groupDeleted", handleGroupDeleted);
        socket.off("groupAvatarChanged", handleAvatarChange);
      };
    }
  }, [socket, handlerRefresh, addConversation]);

  useEffect(() => {
    if (userInfo) {
      setIsLoading(false); // Nếu có user info, không cần loading
    }

    // Kiểm tra nếu có tham số `screen` được truyền
    const initialScreen = route.params?.screen;
    if (initialScreen) {
      setCurrentScreen(initialScreen);
    }
  }, [userInfo, route.params]);

  return (
    <View style={HomeStyle.homeContainer}>
      <HeadView page={screens[index].name} userInfo={userInfo} />
      <TabView value={index} onChange={setIndex} animationType="spring">
        {screens.map((screen, idx) => (
          <TabView.Item key={idx} style={{ width: "100%" }}>
            {screen.component}
          </TabView.Item>
        ))}
      </TabView>
      <Footer setCurrentScreen={setCurrentScreen} />
    </View>
  );
};

export default Home;
