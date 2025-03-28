import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Color from "@/app/components/colors/Color";

const SearchHeader = ({ onSearch, onCancel }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="arrow-back" size={22} color="grey" onPress={onCancel} />
      <TextInput
        style={styles.input}
        placeholder="Tìm tin nhắn..."
        onChangeText={onSearch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    padding: 5,
    //cở chữ
    fontSize: 15,
    fontStyle: "normal",
    color: Color.gray,
  },
});

export default SearchHeader;
