import React from "react";
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

const OptionalScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { receiver, groupName, participants, isGroup } = route.params;

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
        <ConversationName
          receiver={receiver}
          groupName={groupName}
          participants={participants}
        />
        <Description isGroup={isGroup} />
        <GalleryOption isGroup={isGroup}></GalleryOption>
        <GroupOption
          isGroup={isGroup}
          receiver={receiver}
          participants={participants}
        ></GroupOption>
        <ConversationOption
          isGroup={isGroup}
          receiver={receiver}
        ></ConversationOption>
        <BanAndRemoveOption
          isGroup={isGroup}
          receiver={receiver}
        ></BanAndRemoveOption>
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
