import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import MenuTab from "./MenuTab";
import Friend from "./friend/ListFriends";

const Directory = () => {
  const [currentScreen, setCurrentScreen] = useState("friends");
  const screenComponents = {
    friends: () => <Friend />,
    groups: () => <Group />,
    QA: () => <QA />,
  };
  const CurrentScreenComponent =
    screenComponents[currentScreen] || (() => <Text>Screen not found</Text>);

  return (
    <View>
      <MenuTab></MenuTab>
      <View style={styles.container}>
        <CurrentScreenComponent />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 0,
    marginBottom: 70,
  },


});

export default Directory;
