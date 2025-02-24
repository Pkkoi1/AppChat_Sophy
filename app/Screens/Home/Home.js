import React, { useState } from "react";
import { View } from "react-native";
import Footer from "../Footer/Footer";
import HomeStyle from "./HomeStyle";
import HeadView from "../Header/Header";
import ListInbox from "../Inbox/ListInbox";
import Register from "../Register/Register";
import ForgotPassword from "../Login/ForgotPassword";
import Chat from "../Chat/Body";

const Home = () => {
  const [currentScreen, setCurrentScreen] = useState("Inbox");
  const screenComponents = {
    Inbox: <ListInbox />,
    Register: <Register />,
    ForgotPassword: <ForgotPassword />,
    Chat: <Chat />,
  };

  return (
    <View style={HomeStyle().homeContainer}>
      <HeadView />

      <View style={{ flex: 1 }}>{screenComponents[currentScreen]}</View>

      <Footer setCurrentScreen={setCurrentScreen} />
    </View>
  );
};

export default Home;
