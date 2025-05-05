import React, { useContext } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import ConversationName from "./name/ConversationName";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Description from "./description/DescriptionOption";
import GalleryOption from "./gallery/GalleryOption";
import GroupOption from "./group/GroupOption";
import ConversationOption from "./conversationOption/ConversationOption";
import BanAndRemoveOption from "./banAndRemove/BanAndRemoveOption";
import Colors from "../../../components/colors/Color";
import { AuthContext } from "@/app/auth/AuthContext";
import GroupSetting from "./groupSetting/GroupSetting";

const OptionalScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { receiver, conversation } = route.params;
  const { userInfo, groupMember } = useContext(AuthContext);

  const isOwner = groupMember.some(
    (member) => member.id === userInfo.userId && member.role === "owner"
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="white"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Tùy chọn</Text>
      </View>
      <ScrollView>
        <ConversationName receiver={receiver} conversation={conversation} />
        <Description
          isGroup={conversation?.isGroup}
          conversation={conversation}
        />
        <GalleryOption
          isGroup={conversation?.isGroup}
          conversation={conversation}
        />
        {conversation?.isGroup && isOwner && (
          <GroupSetting conversation={conversation} />
        )}
        <GroupOption receiver={receiver} conversation={conversation} />
        <ConversationOption conversation={conversation} receiver={receiver} />
        <BanAndRemoveOption conversation={conversation} receiver={receiver} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    backgroundColor: Colors.sophy,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
    color: "white",
  },
});

export default OptionalScreen;
