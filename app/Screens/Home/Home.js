import React, { useState } from "react";
import { View, Text } from "react-native";
import Footer from "../footer/Footer";
import HomeStyle from "./HomeStyle";
import HeadView from "../header/Header";
import ListInbox from "../inbox/ListInbox";
import Profile from "../profile/Profile";
import ForgotPassword from "../login/ForgotPassword";
import Directory from "../directory/Index.jsx";
import Chat from "../chat/Body";
import Discover from "../discover/Discover";
import Diary from "../diary/Diary";

const Home = () => {
  const [currentScreen, setCurrentScreen] = useState("Inbox");

  const screenComponents = {
    Inbox: () => <ListInbox />,
    Directory: () => <Directory />,
    ForgotPassword: () => <ForgotPassword />,
    Chat: () => <Chat />,
    Discover: () => <Discover/>,
    Diary: () => <Diary />,
    Profile: () => <Profile />,
    
  };

  const CurrentScreenComponent =
    screenComponents[currentScreen] || (() => <Text>Screen not found</Text>);

  return (
    <View style={HomeStyle().homeContainer}>
      <HeadView page={currentScreen} />
      <View style={{ flex: 1 }}>
        <CurrentScreenComponent />
      </View>
      <Footer setCurrentScreen={setCurrentScreen} />
    </View>
  );
};

export default Home;
