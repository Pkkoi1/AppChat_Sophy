import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Main from "@/app/Screens/Main/Main";
import Register from "@/app/Screens/Register/Register";
import Login from "@/app/Screens/Login/Login";
import ForgotPassword from "@/app/Screens/Login/ForgotPassword";
import { StyleSheet } from "react-native";
import SocialNetworkTerms from "./Screens/Register/SocialNetworkTerms";
import TermsOfService from "./Screens/Register/TermsOfService";
import Home from "./Screens/Home/Home";
import Chat from "./Screens/Chat/Body";
import Profile from "./Screens/Profile/Profile";

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
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
});
