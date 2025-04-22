import React, { useContext, useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
import { AuthContext } from "@/app/auth/AuthContext";
import RenderMember from "./RenderMember";

const GroupMember = ({ conversation }) => {
  const navigation = useNavigation();
  const { userInfo } = useContext(AuthContext);
  const [userInfos, setUserInfos] = useState({});

  useEffect(() => {
    const fetchAllUserInfo = async () => {
      const userInfoMap = {};
      for (const userId of conversation?.groupMembers || []) {
        const userInfo = await fetchUserInfo(userId);
        if (userInfo) {
          userInfoMap[userId] = userInfo;
        }
      }
      setUserInfos(userInfoMap);
    };

    fetchAllUserInfo();
  }, [conversation?.groupMembers]);

  const sortedGroupMembers = conversation?.groupMembers?.sort((a, b) => {
    if (a === conversation?.rules.ownerId) return -1;
    if (b === conversation?.rules.ownerId) return 1;
    return 0;
  });

  return (
    <View style={styles.container}>
      <FlatList
        style={{ padding: 16 }}
        data={sortedGroupMembers}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <RenderMember
            item={item}
            userInfo={userInfo}
            userInfos={userInfos}
            navigation={navigation}
            conversation={conversation}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default GroupMember;
