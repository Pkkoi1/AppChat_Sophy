import { StyleSheet, Platform } from "react-native";

const HomeStyle = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: 10,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 6,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    borderColor: "#fff",
    borderWidth: 2,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  footer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 50,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    paddingBottom: Platform.OS === "ios" ? 10 : 0,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 12,
    marginTop: 2,
    color: "#000",
    fontWeight: "bold",
  },
});

export default HomeStyle;
