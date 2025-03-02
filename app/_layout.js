import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Main from "@/app/Screens/main/Main";
import Register from "@/app/Screens/register/Register";
import Login from "@/app/Screens/login/Login";
import ForgotPassword from "@/app/Screens/login/ForgotPassword";
import { StyleSheet } from "react-native";
import SocialNetworkTerms from "./Screens/register/SocialNetworkTerms";
import TermsOfService from "./Screens/register/TermsOfService";
import Home from "./Screens/home/Home";
import Chat from "./Screens/chat/Body";
import Profile from "./Screens/profile/Profile";
import Discover from "./Screens/discover/Discover";
import Diary from "./Screens/diary/Diary";

export default function RootLayout() {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      styles={styles.container}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Main" component={Main} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="SocialNetworkTerms" component={SocialNetworkTerms} />
      <Stack.Screen name="TermsOfService" component={TermsOfService} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Chat" component={Chat} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Discover" component={Discover} />
      <Stack.Screen name="Diary" component={Diary} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
});
