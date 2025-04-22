import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Tab } from "@rneui/themed";
import GroupMember from "./GroupMember"; // Ensure the path is correct
import OptionHeader from "@/app/features/optionHeader/OptionHeader";
import Color from "@/app/components/colors/Color";

const Index = ({ route }) => {
  const { conversation } = route.params;
  const [activeTab, setActiveTab] = useState(0);

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <GroupMember conversation={conversation} />;
      case 1:
        return (
          <View style={styles.contentContainer}>
            <Text>Danh sách trường và phó nhóm</Text>
          </View>
        );
      case 2:
        return (
          <View style={styles.contentContainer}>
            <Text>Danh sách đã mời</Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <OptionHeader title={"Danh sách thành viên nhóm"}></OptionHeader>

      <Tab
        value={activeTab}
        onChange={setActiveTab}
        indicatorStyle={styles.indicator}
      >
        <Tab.Item title="Tất cả" titleStyle={styles.tabTitle} />
        <Tab.Item title={"Trường và phó nhóm"} titleStyle={styles.tabTitle} />
        <Tab.Item title="Đã mời" titleStyle={styles.tabTitle} />
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
