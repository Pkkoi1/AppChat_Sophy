import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider } from "react-native-paper";
import { StyleSheet } from "react-native";

import Register from "./Screens/register/Register";
import Login from "./Screens/login/Login";
import ForgotPassword from "./Screens/login/ForgotPassword";
import SocialNetworkTerms from "./Screens/register/SocialNetworkTerms";
import TermsOfService from "./Screens/register/TermsOfService";
import Home from "./Screens/home/Home";
import Chat from "./Screens/chat/Body";
import Profile from "./Screens/profile/Profile";
import Discover from "./Screens/discover/Discover";
import Diary from "./Screens/diary/Diary";
import Main from "./Screens/main/Main";

const Stack = createNativeStackNavigator();

function RootLayout() {
  return (
    <PaperProvider>
      <Stack.Navigator
        styles={styles.container}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen
          name="SocialNetworkTerms"
          component={SocialNetworkTerms}
        />
        <Stack.Screen name="TermsOfService" component={TermsOfService} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Discover" component={Discover} />
        <Stack.Screen name="Diary" component={Diary} />
      </Stack.Navigator>
    </PaperProvider>
  );
}

export default RootLayout;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
});
