import React from "react";
import { Text, StyleSheet } from "react-native";

const HighlightText = ({ text, highlight, style }) => {
  if (!highlight || highlight.trim() === "") {
    return <Text style={style}>{text}</Text>;
  }

  // Tách nội dung thành các phần dựa trên từ khóa
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);

  return (
    <Text style={style}>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Text key={index} style={styles.highlight}>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  );
};

const styles = StyleSheet.create({
  highlight: {
    backgroundColor: "#ffff00", // Nền vàng
    fontWeight: "bold", // Chữ đậm
  },
});

export default HighlightText;
