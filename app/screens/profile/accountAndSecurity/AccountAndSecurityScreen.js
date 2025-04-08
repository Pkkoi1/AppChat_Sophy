import { Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { useState } from "react";
import Color from "@/app/components/colors/Color";
import { LinearGradient } from "expo-linear-gradient";
import Account from "./account/Account";
import OptionHeader from "@/app/features/optionHeader/OptionHeader";
import { AuthContext } from "@/app/auth/AuthContext"; // Import useAuth hook
import Security from "./account/Security"; // Import Security
import Login from "./account/Login"; // Import Login

const AccountAndSecurityScreen = ({ route }) => {
  const navigation = useNavigation();
  // const route = useRoute();
  // const { userInfo } = route.params;
  const { userInfo } = useContext(AuthContext);

  const [user, setUser] = useState({});
  const [userId, setUserId] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [fullname, setFullname] = useState(null);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1f7bff", "#12bcfa"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <OptionHeader
          title={"Tài khoản và bảo mật"}
          previousScreen={"Setting"}
          params={{
            userInfo: userInfo,
          }}
        />
      </LinearGradient>
      <ScrollView>
        <Account navigation={navigation} />
        <Security navigation={navigation} />
        <Login navigation={navigation} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    // backgroundColor: Color.sophy,
  },
  headerTitle: {
    fontSize: 15,
    color: "#fff",
    marginLeft: 10,
    fontWeight: "500",
  },
});

export default AccountAndSecurityScreen;
