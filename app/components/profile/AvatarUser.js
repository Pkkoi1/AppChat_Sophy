import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const AvatarUser = ({ fullName, width, height, avtText }) => {
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

  const initials = getInitials(fullName);

  return (
    <View style={styles.avatarContainer}>
      <View style={[styles.avatar, { width, height }]}>
        <Text style={[styles.avatarText, { fontSize: avtText }]}>
          {initials}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: "center",
  },
  avatar: {
    borderRadius: 50,
    backgroundColor: "#00cc00",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
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
  name: {
    fontSize: 24,
    color: "#000",
    marginVertical: 10,
    fontWeight: "bold",
  },
  editText: {
    color: "#00aaff",
    marginBottom: 10,
    fontSize: 14,
  },
});

export default AvatarUser;
