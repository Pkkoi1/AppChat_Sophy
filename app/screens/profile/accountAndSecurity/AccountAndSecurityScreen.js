import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { useState } from "react";
import Color from "@/app/components/colors/Color";
import { LinearGradient } from "expo-linear-gradient";
import Account from "./account/Account";

const AccountAndSecurityScreen = ({ route }) => {
  const navigation = useNavigation();
  // const route = useRoute();
  const { userInfo } = route.params;
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
        <View style={styles.header}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="white"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>
            Tài khoản và bảo mật
          </Text>
        </View>
      </LinearGradient>
      <ScrollView>
        <Account userInfo={userInfo} navigation={navigation} />
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
