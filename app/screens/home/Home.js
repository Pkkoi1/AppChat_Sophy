import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { TabView } from "@rneui/themed";
import ListInbox from "../inbox/ListInbox";
import Profile from "../profile/Profile";
import Directory from "../directory/Index";
import Discover from "../discover/Discover";
import Diary from "../diary/Diary";
import HeadView from "../header/Header";
import Footer from "../footer/Footer";
import HomeStyle from "./HomeStyle";
import { api } from "@/app/api/api";
import Loading from "@/app/components/loading/Loading";
import { useFocusEffect } from "@react-navigation/native";

const Home = ({ route }) => {
  const { userId, userName, phone } = route.params;
  const [index, setIndex] = useState(0);
  const [userInfo, setUserInfo] = useState({});

  const screens = [
    {
      name: "Inbox",
      component: <ListInbox userId={userId} />,
      icon: "message1",
      title: "Tin nhắn",
    },
    {
      name: "Directory",
      component: <Directory userId={userId} />,
      icon: "contacts",
      title: "Danh bạ",
    },
    {
      name: "Discover",
      component: <Discover userId={userId} />,
      icon: "find",
      title: "Khám phá",
    },
    {
      name: "Diary",
      component: <Diary userId={userId} />,
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

  const fetchUserInfo = async () => {
    if (Object.keys(userInfo).length > 0) {
      console.log("User info already loaded, skipping API call.");
      return; // Nếu đã có dữ liệu, không gọi lại API
    }

    try {
      const response = await api.getUserById(userId);
      console.log("API Response:", response.data); // Log dữ liệu trả về từ API
      if (response && response.data) {
        setUserInfo(response.data);
      } else {
        console.error("No user info found in the response.");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      console.error("Error details:", error.response?.data || error.message);
      console.error("Userid:", userId);
      setUserInfo({});
    }
  };

  // Gọi hàm fetchUserInfo khi component được mount
  useFocusEffect(
    React.useCallback(() => {
      fetchUserInfo(); // Gọi lại API khi màn hình được focus
    }, [])
  );

  return (
    <View style={HomeStyle.homeContainer}>
      {Object.keys(userInfo).length === 0 ? ( // Kiểm tra nếu userInfo rỗng
        <Loading /> // Hiển thị giao diện loading
      ) : (
        <>
          <HeadView page={screens[index].name} userInfo={userInfo} />
          <TabView value={index} onChange={setIndex} animationType="spring">
            {screens.map((screen, idx) => (
              <TabView.Item key={idx} style={{ width: "100%" }}>
                {screen.component}
              </TabView.Item>
            ))}
          </TabView>
          <Footer setCurrentScreen={setCurrentScreen} />
        </>
      )}
    </View>
  );
};

export default Home;
