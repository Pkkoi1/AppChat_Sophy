import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const AvatarUser = ({
  fullName,
  width,
  height,
  avtText,
  shadow = true,
  bordered = true,
  borderWidth = 4,
  style = {}, // Nhận style từ bên ngoài
  keyProp, // Nhận key từ bên ngoài
}) => {
  const getInitials = (name) => {
    if (!name) return "";
    const nameParts = name.split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    const firstNameInitial = nameParts[nameParts.length - 2]
      .charAt(0)
      .toUpperCase();
    const lastNameInitial = nameParts[nameParts.length - 1]
      .charAt(0)
      .toUpperCase();
    return firstNameInitial + lastNameInitial;
  };

  const convertToEnglish = (char) => {
    const vietnameseMap = {
      Ă: "A",
      Â: "A",
      Á: "A",
      À: "A",
      Ả: "A",
      Ã: "A",
      Ạ: "A",
      Đ: "D",
      Ê: "E",
      É: "E",
      È: "E",
      Ẻ: "E",
      Ẽ: "E",
      Ẹ: "E",
      Í: "I",
      Ì: "I",
      Ỉ: "I",
      Ĩ: "I",
      Ị: "I",
      Ô: "O",
      Ơ: "O",
      Ó: "O",
      Ò: "O",
      Ỏ: "O",
      Õ: "O",
      Ọ: "O",
      Ú: "U",
      Ù: "U",
      Ủ: "U",
      Ũ: "U",
      Ụ: "U",
      Ư: "U",
      Ý: "Y",
      Ỳ: "Y",
      Ỷ: "Y",
      Ỹ: "Y",
      Ỵ: "Y",
    };
    return vietnameseMap[char] || char;
  };

  const getColorForInitial = (initial) => {
    const englishInitial = convertToEnglish(initial);
    const charCode = englishInitial.charCodeAt(0);
    if (charCode >= 65 && charCode <= 69) return ["#fb8137", "#fbc398"]; // A-E
    if (charCode >= 70 && charCode <= 74) return ["#00cc00", "#1AFF8D"]; // F-J
    if (charCode >= 75 && charCode <= 79) return ["#3357FF", "#1A8DFF"]; // K-O
    if (charCode >= 80 && charCode <= 84) return ["#8D33FF", "#D91AFF"]; // P-T
    if (charCode >= 85 && charCode <= 90) return ["#FF33A1", "#FF1A57"]; // U-Z
    return ["#CCCCCC", "#AAAAAA"]; // Default color
  };

  const initials = getInitials(fullName);
  const colors = getColorForInitial(initials.charAt(0));

  return (
    <View style={[styles.avatarContainer, style]} key={keyProp || null}>
      <LinearGradient
        colors={colors}
        style={[
          styles.avatar,
          { width, height, borderRadius: width / 2 },
          shadow && styles.shadow, // Thêm bóng nếu `shadow` là true
          bordered && { borderWidth, borderColor: "#fff" }, // Sử dụng borderWidth nếu `bordered` là true
        ]}
      >
        <Text style={[styles.avatarText, { fontSize: avtText }]}>
          {initials}
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: "center",
  },
  avatar: {
    justifyContent: "center",
    alignItems: "center",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  avatarText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AvatarUser;
