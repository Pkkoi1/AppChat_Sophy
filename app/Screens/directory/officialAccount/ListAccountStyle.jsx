import { StyleSheet } from "react-native";

const ListAccountsStyle = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#ffffff",
  },
  accountCount: {
    fontSize: 13,
    fontWeight: "500",
    paddingHorizontal: 10,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortText: {
    marginLeft: 5,
    color: "#929598",
  },
  menuItem: {
    color: "#000",
  },
  menuDivider: {
    backgroundColor: "#ccc",
  },
});

export default ListAccountsStyle;
