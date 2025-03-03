import React, { useState } from "react";
import { View, Text } from "react-native";
import Footer from "../footer/Footer.js";
import HomeStyle from "./HomeStyle.js";
import HeadView from "../header/Header.js";
import ListInbox from "../inbox/ListInbox.js";
import Profile from "../profile/Profile.js";
import ForgotPassword from "../login/ForgotPassword.js";
import Directory from "../directory/Index.js";
import Chat from "../chat/Body.js";
import Discover from "../discover/Discover.js";
import Diary from "../diary/Diary.js";

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
