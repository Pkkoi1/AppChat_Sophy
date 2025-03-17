import React from "react";
import { Text, StyleSheet } from "react-native";

const HighlightText = ({ text, highlight }) => {
  if (!highlight.trim()) {
    return <Text>{text}</Text>;
  }

  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);

  return (
    <Text>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Text key={index} style={styles.highlight}>
            {part}
          </Text>
        ) : (
          <Text key={index}>{part}</Text>
        )
      )}
    </Text>
  );
};

const styles = StyleSheet.create({
  highlight: {
    backgroundColor: "yellow",
  },
});

export default HighlightText;