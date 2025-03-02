import React, { useState } from "react";
import { View, Text } from "react-native";
import Footer from "../Footer/Footer";
import HomeStyle from "./HomeStyle";
import HeadView from "../Header/Header";
import ListInbox from "../Inbox/ListInbox";
import Profile from "../Profile/Profile";
import ForgotPassword from "../Login/ForgotPassword";
import Directory from "../directory/Index.jsx";
import Chat from "../Chat/Body";
import Discover from "../Discover/Discover";

const Home = () => {
  const [currentScreen, setCurrentScreen] = useState("Inbox");

  const screenComponents = {
    Inbox: () => <ListInbox />,
    Directory: () => <Directory />,
    ForgotPassword: () => <ForgotPassword />,
    Chat: () => <Chat />,
    Discover: () => <Discover/>,
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
