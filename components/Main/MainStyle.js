import { StyleSheet } from 'react-native';

const MainStyle = (props) => {
  return StyleSheet.create({
    app_name: {
      fontSize: props.width > 400 ? 40 : 30, 
      marginTop: "20%",
      color: "#1b6dfa",
      fontWeight: "bold",
    },
    imageBanner: {
      marginTop: "20%", 
      height: props.height * 0.5,
    },
    imageContainer: {
      width: props.width, 
      alignItems: "center",
    },
    image: {
      width: props.width * 0.8,
      height: 200,
    },
    textContainer: {
      alignItems: "center",
      marginTop: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
    },
    description: {
      textAlign: "center",
      marginHorizontal: 20,
    },
    indicatorContainer: {
      flexDirection: "row",
      position: "absolute",
      bottom: props.width * 0.15, 
      justifyContent: "center",
      width: "100%",
    },
    indicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginHorizontal: 5,
    },
    activeIndicator: {
      backgroundColor: "#1b6dfa",
    },
    inactiveIndicator: {
      backgroundColor: "gray",
    },
    signIn_Button: {
      backgroundColor: "#1068fe",
    },
    signUp_Button: {
      backgroundColor: "#e9efef",
    },
    buttonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
    },
    buttonSignUpText: {
      color: "#0d0d0d",
      fontSize: 18,
      fontWeight: "bold",
    },
    buttonContainer: {
      position: "absolute",
      bottom: 50,
      width: "100%",
      alignItems: "center",
    },
  });
};

export default MainStyle;