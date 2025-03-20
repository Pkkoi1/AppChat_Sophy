import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider } from "react-native-paper";
import { Settings, StyleSheet } from "react-native";

import Register from "./screens/register/Register";
import Login from "./screens/login/Login";
import ForgotPassword from "./screens/login/ForgotPassword";
import SocialNetworkTerms from "./screens/register/SocialNetworkTerms";
import TermsOfService from "./screens/register/TermsOfService";
import Home from "./screens/home/Home";
import Chat from "./screens/chat/MessageScreen";
import Profile from "./screens/profile/Profile";
import Discover from "./screens/discover/Discover";
import Diary from "./screens/diary/Diary";
import Main from "./screens/main/Main";
import MyProfile from "./screens/profile/MyProfile";
import Setting from "./screens/profile/Setting";
import ReceivedFriendRequests from "./screens/directory/friend/friendRequest/ReceivedFriendRequests";
import UserProfile from "./screens/profile/userProfile/UserProfile"; // Đảm bảo đường dẫn đúng
import AddFriend from "./screens/profile/userProfile/AddFriend"; // Đảm bảo đường dẫn đúng
import AcceptFriend from "./screens/profile/userProfile/AcceptFriend"; // Đảm bảo đường dẫn đúng
import Options from "./screens/optional/OptionalScreen";
import { NavigationContainer } from "@react-navigation/native";

const Stack = createNativeStackNavigator();

function RootLayout() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade", // Tắt hoạt ảnh chuyển cảnh
        }}
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
        <Stack.Screen name="MyProfile" component={MyProfile} />
        <Stack.Screen name="Setting" component={Setting} />
        <Stack.Screen
          name="ReceivedFriendRequests"
          component={ReceivedFriendRequests}
        />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="AddFriend" component={AddFriend} />
        <Stack.Screen name="AcceptFriend" component={AcceptFriend} />
        <Stack.Screen
          name="Options"
          component={Options}
          options={{ animation: "slide_from_right" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootLayout;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
});
