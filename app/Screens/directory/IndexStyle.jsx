import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // Style cho MenuTab
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  menubar: {
    backgroundColor: "#fff",
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 1,
    minHeight: 30,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "thin",
    color: "#7f7f7f",
    textAlign: "center",
    paddingVertical: 6,
  },
  activeItem: {
    backgroundColor: "#0767fd",
    height: 3,
  },
  activeText: {
    color: "#000",
    fontWeight: "bold",
  },

  // Style cho nội dung TabView
  tabContainer: {
    backgroundColor: "#f9f9f9",
    padding: 0,
    marginBottom: 35,
  },
});

export default styles;
