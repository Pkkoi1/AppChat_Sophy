import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native"; // Thay thế expo-routerimport React from "react";
import { StyleSheet, Text, View } from "react-native";

const OptionHeader = ({ title }) => {
  const navigation = useNavigation();
  return (
    <LinearGradient
      colors={["#1f7bff", "#12bcfa"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="white"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
  },
  headerTitle: {
    fontSize: 15,
    color: "#fff",
    marginLeft: 10,
    fontWeight: "600",
  },
});

export default OptionHeader;
