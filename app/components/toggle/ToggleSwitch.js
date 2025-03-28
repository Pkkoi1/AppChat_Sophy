import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";

const ToggleSwitch = ({ isOn, onToggle }) => {
  return (
    <TouchableOpacity
      style={[
        styles.toggle,
        {
          backgroundColor: isOn ? "#1b96fd" : "#ccc",
        },
      ]}
      onPress={onToggle}
    >
      <View
        style={[
          styles.circle,
          { marginLeft: isOn ? 20 : 0 },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggle: {
    width: 40,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    padding: 2,
  },
  circle: {
    width: 16,
    height: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
});

export default ToggleSwitch;