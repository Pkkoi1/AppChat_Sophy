import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Tab } from "@rneui/themed";
import OptionHeader from "@/app/features/optionHeader/OptionHeader";
import ImageTab from "./images/Image"; // Import the ImageTab component
import FileTab from "./files/File"; // Import the FileTab component

const File = ({ route }) => {
  const { conversation } = route.params;

  const [activeTab, setActiveTab] = useState(0);

  const renderLinks = () => {
    const links = conversation?.listLink || [];
    if (links.length === 0) {
      return <Text style={styles.noDataText}>Không có liên kết</Text>;
    }
    return (
      <FlatList
        data={links}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.linkItem}>
            <Text style={styles.linkText}>{item.url}</Text>
          </View>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <OptionHeader title={"Ảnh, file, link"} />
      <Tab
        value={activeTab}
        onChange={(index) => setActiveTab(index)}
        indicatorStyle={styles.indicator}
      >
        <Tab.Item title="Ảnh" titleStyle={styles.tabTitle} />
        <Tab.Item title="File" titleStyle={styles.tabTitle} />
        <Tab.Item title="Link" titleStyle={styles.tabTitle} />
      </Tab>
      <View style={styles.content}>
        {activeTab === 0 && <ImageTab conversation={conversation} />}
        {activeTab === 1 && <FileTab conversation={conversation} />}
        {activeTab === 2 && renderLinks()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  indicator: {
    backgroundColor: "#1f7bff",
    height: 3,
  },
  tabTitle: {
    fontSize: 14,
    color: "#888c90",
  },
  content: {
    flex: 1,
    padding: 10,
  },
  noDataText: {
    fontSize: 16,
    color: "#888c90",
    textAlign: "center",
    marginTop: 20,
  },
  linkItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  linkText: {
    fontSize: 14,
    color: "#1f7bff",
  },
});

export default File;
