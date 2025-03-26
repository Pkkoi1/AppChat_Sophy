import Color from "@/components/colors/Color";
import { StyleSheet } from "react-native";
import { overlay } from "react-native-paper";

const RegisterStyle = (props) => {
  const { width, height } = props;
  return StyleSheet.create({
    phone_field: {
      width: width * 0.9,
      height: height * 0.3,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      top: -20,
    },
    app_name: {
      fontSize: 30,
      alignItems: "center",
      textAlign: "center",
      color: "black",
      fontWeight: "500",
      marginBottom: 20,
    },
    linkText: {
      color: "#0c8de8",
      textDecorationLine: "none",
      fontWeight: "bold",
      textAlign: "left",
    },
    text: {
      flexWrap: "wrap",
    },
    clause_field: {
      display: "flex",
      flexDirection: "column",
      top: height * -0.1,
    },
    check_option: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      marginTop: 0,
      marginBottom: -20,
    },
    submit: {
      alignItems: "center",
      top: height * -0.03,
    },
    button_not_checked: {
      backgroundColor: "#e0e0e0",
      width: width * 0.9,
      height: 50,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
    },
    button_checked: {
      backgroundColor: Color.sophy, // Màu xanh khi được kích hoạt
      width: width * 0.9,
      height: 50,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
    },
    submit_text: {
      color: "#a7acb2",
      fontSize: 16,
      fontWeight: "bold",
    },
    submit_text_checked: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    footer_option: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      bottom: 0,
      width: "100%",
      padding: 10,
    },
    overlay: {
      borderRadius: 100,
    },
  });
};

export default RegisterStyle;
