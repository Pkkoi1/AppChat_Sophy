import { StyleSheet } from "react-native";

const GroupStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,

    backgroundColor: "white",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  content: {
    flex: 1,
    paddingBottom: 10,
    borderBottomWidth: 0.2,
    borderBottomColor: "#ddd",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupName: {
    fontSize: 16,
    fontWeight: "medium",
    flex: 1,
  },
  date: {
    color: "gray",
    fontSize: 12,
    marginLeft: 10,
  },
  message: {
    color: "gray",
    fontSize: 14,
  },
});

export default GroupStyle;
