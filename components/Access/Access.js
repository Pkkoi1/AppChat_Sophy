import React, { useLayoutEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Access = () => {

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sophy</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "blue",
    height: "100%",
    width: "100%",
  },
  text: {
    fontSize: 100,
    color: "white",
    fontStyle: "bold",
    fontFamily: "Roboto",
  },
});

export default Access;