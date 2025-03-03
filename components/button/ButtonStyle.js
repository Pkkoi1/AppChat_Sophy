import { StyleSheet } from "react-native";

const submitButton = () => {
  return StyleSheet.create({
    submit: {
      margin: 10,
      marginBottom: 10,
      padding: 10,
      borderRadius: 50,
      width: "90%",
      height: 50,
      justifyContent: "center",
      alignItems: "center",
    },
  });
};

export default submitButton;