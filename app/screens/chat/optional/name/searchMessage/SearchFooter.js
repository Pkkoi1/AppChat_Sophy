import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

const SearchFooter = ({
  resultCount,
  currentIndex,
  onNext,
  onPrevious,
  disableNext,
  disablePrevious,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {resultCount > 0
          ? `Kết quả: ${currentIndex + 1}/${resultCount}`
          : "Không có kết quả"}
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, disablePrevious && styles.disabledButton]}
          onPress={onPrevious}
          disabled={disablePrevious}
        >
          <AntDesign
            name="up"
            size={20}
            color={disablePrevious ? "#aaa" : "#007BFF"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, disableNext && styles.disabledButton]}
          onPress={onNext}
          disabled={disableNext}
        >
          <AntDesign
            name="down"
            size={20}
            color={disableNext ? "#aaa" : "#007BFF"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: "#ddd",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
  },
  button: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default SearchFooter;
