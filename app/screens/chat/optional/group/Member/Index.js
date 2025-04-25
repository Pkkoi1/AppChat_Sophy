import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Tab } from "@rneui/themed";
import GroupMember from "./tabs/GroupMember";
import BlockedMembers from "./tabs/BlockedMembers";
import OptionHeader from "@/app/features/optionHeader/OptionHeader";
import Color from "@/app/components/colors/Color";
import OwnerMember from "./tabs/OwnerMember";

const Index = ({ route }) => {
  const [conversation, setConversation] = useState(route.params.conversation);
  const [activeTab, setActiveTab] = useState(0);

  const handleConversationUpdate = useCallback((updatedConversation) => {
    setConversation(updatedConversation);
  }, []);

  // Update conversation when route params change
  useEffect(() => {
    if (route.params?.conversation) {
      setConversation(route.params.conversation);
    }
  }, [route.params?.conversation]);

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <GroupMember
            conversation={conversation}
            onConversationUpdate={handleConversationUpdate}
          />
        );
      case 1:
        return (
          <OwnerMember
            conversation={conversation}
            onConversationUpdate={handleConversationUpdate}
          />
        );
      // case 2:
      //   return (
      //     <View style={styles.contentContainer}>
      //       <Text>Danh sách đã mời</Text>
      //     </View>
      //   );
      case 2:
        return (
          <BlockedMembers
            conversation={conversation}
            onConversationUpdate={handleConversationUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <OptionHeader title={"Danh sách thành viên nhóm"} />

      <Tab
        value={activeTab}
        onChange={setActiveTab}
        indicatorStyle={styles.indicator}
        scrollable={true}
      >
        <Tab.Item title="Tất cả" titleStyle={styles.tabTitle} />
        <Tab.Item title={"Trường và phó nhóm"} titleStyle={styles.tabTitle} />
        {/* <Tab.Item title="Đã mời" titleStyle={styles.tabTitle} /> */}
        <Tab.Item title="Đã chặn" titleStyle={styles.tabTitle} />
      </Tab>
      <View style={styles.contentContainer}>{renderContent()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  indicator: {
    backgroundColor: Color.sophy,
    height: 3,
  },
  tabTitle: {
    fontSize: 12,
    color: "#000",
  },
  contentContainer: {
    flex: 1,
  },
});

export default Index;
