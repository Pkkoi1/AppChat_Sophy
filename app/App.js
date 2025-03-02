import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider } from "react-native-paper";
import { StyleSheet } from "react-native";

import Main from "./Screens/Main/Main";
import Register from "./Screens/Register/Register";
import Login from "./Screens/Login/Login";
import ForgotPassword from "./Screens/Login/ForgotPassword";
import SocialNetworkTerms from "./Screens/Register/SocialNetworkTerms";
import TermsOfService from "./Screens/Register/TermsOfService";
import Home from "./Screens/Home/Home";
import Chat from "./Screens/Chat/Body";
import Profile from "./Screens/Profile/Profile";

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
