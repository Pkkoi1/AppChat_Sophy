import React, { useState, useEffect, useContext } from "react";
import { View, BackHandler } from "react-native";
import { TabView } from "@rneui/themed";
import ListInbox from "../inbox/ListInbox";
import Profile from "../profile/Profile";
import Directory from "../directory/Index";
import Discover from "../discover/Discover";
import Diary from "../diary/Diary";
import HeadView from "../header/Header";
import Footer from "../footer/Footer";
import HomeStyle from "./HomeStyle";
import Loading from "@/app/components/loading/Loading";
import { SocketContext } from "@/app/socket/SocketContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RaiAssistantFloatingChat from "@/app/features/aiAssistant/AiAssistantFloatingChat";

const Home = ({ route, navigation }) => {
  const socket = useContext(SocketContext);
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  const screens = [
    {
      name: "Inbox",
      component: <ListInbox />,
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

  // Lấy userInfo từ AsyncStorage
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfoString = await AsyncStorage.getItem("userInfo");
        console.log("userInfoString from AsyncStorage:", userInfoString);

        if (userInfoString) {
          const parsedUserInfo = JSON.parse(userInfoString);
          console.log("Parsed userInfo:", parsedUserInfo);

          if (
            parsedUserInfo &&
            parsedUserInfo.userId &&
            parsedUserInfo.fullname
          ) {
            setUserInfo(parsedUserInfo);
          } else {
            console.log("userInfo không hợp lệ, điều hướng về Main");
            navigation.replace("Main");
          }
        } else {
          console.log("Không tìm thấy userInfo, điều hướng về Main");
          navigation.replace("Main");
        }
      } catch (error) {
        console.error("Lỗi khi lấy userInfo từ AsyncStorage:", error);
        navigation.replace("Main");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigation]);

  // Xử lý sự kiện socket
  useEffect(() => {
    if (socket) {
      const handleNewMessage = async () => {
        console.log(
          "New message received. Refreshing conversations at Home..."
        );
      };

      const handleGroupDeleted = async () => {
        console.log("Group deleted. Refreshing conversations...");
      };

      const handleAvatarChange = async ({ conversationId, newAvatar }) => {
        console.log(
          `Avatar changed for conversation ${conversationId}. Refreshing...`
        );
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
  }, [socket]);

  // Xử lý nút quay lại trên Android
  useEffect(() => {
    const backAction = () => {
      const navState = navigation.getState();
      const currentRoute = navState.routes[navState.index];

      // Chỉ thoát ứng dụng nếu đang ở màn hình Home
      if (currentRoute.name === "Home") {
        BackHandler.exitApp();
        return true; // Ngăn hành vi mặc định
      }
      return false; // Cho phép hành vi mặc định (quay lại màn hình trước)
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Xử lý tham số screen từ route
  useEffect(() => {
    const initialScreen = route.params?.screen;
    if (initialScreen) {
      setCurrentScreen(initialScreen);
    }
  }, [route.params]);

  if (isLoading) {
    return <Loading />;
  }

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
      {/* Hiển thị bong bóng chat AI ở mọi màn hình */}
      <RaiAssistantFloatingChat />
    </View>
  );
};

export default Home;
