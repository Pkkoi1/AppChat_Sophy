import { StyleSheet } from "react-native";

const ListGroupStyle = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
  },
  memberCount: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  sortText: {
    fontSize: 14,
    marginLeft: 5,
    color: "#929598",
  },
  menuItem: {
    color: "#929598",
    fontSize: 14,
  },
  menuDivider: {
    backgroundColor: "#ccc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});

export default ListGroupStyle;
