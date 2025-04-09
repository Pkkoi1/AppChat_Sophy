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
// import Chat from "./screens/testApi/TestScreen";
import Profile from "./screens/profile/Profile";
import Discover from "./screens/discover/Discover";
import Diary from "./screens/diary/Diary";
import Main from "./screens/main/Main";
import MyProfile from "./screens/profile/myProfile/MyProfile";
import Setting from "./screens/profile/Setting/Setting";
import ReceivedFriendRequests from "./screens/directory/friend/friendRequest/ReceivedFriendRequests";
import UserProfile from "./screens/profile/userProfile/UserProfile"; // Đảm bảo đường dẫn đúng
import AddFriend from "./screens/profile/userProfile/AddFriend"; // Đảm bảo đường dẫn đúng
import AcceptFriend from "./screens/profile/userProfile/AcceptFriend"; // Đảm bảo đường dẫn đúng
import Options from "./screens/optional/OptionalScreen";
import { NavigationContainer } from "@react-navigation/native";
import Verify from "./screens/register/Verify";
import VerifyOTPCode from "./screens/register/verifyOTPCode/VerifyOTPCode";
import EnterName from "./screens/register/enterProfile/EnterName";
import EnterInfo from "./screens/register/enterProfile/EnterInfo";
import CameraScreen from "./features/camera/Camera";
// import CameraScreen from "@/components/camera/CameraScreen";>
import ScanQR from "./screens/header/headerAction/ScanQR";
import VerificationCode from "./screens/login/VerificationCode";
import CreateNewPassword from "./screens/login/CreateNewPassword";
import AccountAndSecurityScreen from "./screens/profile/accountAndSecurity/AccountAndSecurityScreen";
import Personal from "./screens/profile/personal/Personal";
import Edit from "./components/profile/Edit";
import AuthLoading from "./auth/AuthLoading";
import { AuthProvider } from "./auth/AuthContext";
import UpdatePassword from "./screens/profile/accountAndSecurity/account/updatePassword/updatePassword";

import EnterAvatar from "./screens/register/enterAvatar/EnterAvatar";

import LoginByQR from "./screens/login/LoginByQR";


const Stack = createNativeStackNavigator();

function RootLayout() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: "fade", // Tắt hoạt ảnh chuyển cảnh
          }}
        >
          <Stack.Screen name="AuthLoading" component={AuthLoading} />

          <Stack.Screen name="Main" component={Main} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="VerifyOTPCode" component={VerifyOTPCode} />
          <Stack.Screen name="EnterName" component={EnterName} />
          <Stack.Screen name="EnterInfo" component={EnterInfo} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen
            name="SocialNetworkTerms"
            component={SocialNetworkTerms}
          />
          <Stack.Screen name="CameraScreen" component={CameraScreen} />
          {/* <Stack.Screen name="TermsOfService" component={TermsOfService} /> */}
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
          <Stack.Screen name="Verify" component={Verify} />
          <Stack.Screen name="ScanQR" component={ScanQR} />
          <Stack.Screen name="VerificationCode" component={VerificationCode} />
          <Stack.Screen
            name="CreateNewPassword"
            component={CreateNewPassword}
          />
          <Stack.Screen
            name="AccountAndSecurity"
            component={AccountAndSecurityScreen}
          />
          <Stack.Screen name="Personal" component={Personal} />
          <Stack.Screen name="Edit" component={Edit} />
          <Stack.Screen name="UpdatePassword" component={UpdatePassword} />
          <Stack.Screen
            name="EnterAvatar"
            component={EnterAvatar}
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen name="LoginByQR" component={LoginByQR} />


        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

export default RootLayout;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
});
