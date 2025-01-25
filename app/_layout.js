import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Main from "@/app/Screens/UI/Main/Main";
import Register from "@/app/Screens/UI/Register/Register";
import { StyleSheet } from "react-native";

export default function RootLayout() {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator
      styles={styles.container}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Main" component={Main} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
});
