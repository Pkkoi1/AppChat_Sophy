import React from "react";
import { View, Text, StyleSheet } from "react-native";

const SearchFooter = ({ resultCount }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Số kết quả tìm kiếm: {resultCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    color: "gray",
  },
});

export default SearchFooter;
