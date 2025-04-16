import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const MessagePopupStyle = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    width: SCREEN_WIDTH * 0.8,
    maxHeight: SCREEN_HEIGHT * 0.7,
    justifyContent: "center",
  },
  messageSection: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignSelf: "center",
  },
  selectedMessageContainer: {
    padding: 10,
    flexShrink: 1,
  },
  selectedMessageText: {
    fontSize: 14,
    color: "#333",
    flexWrap: "wrap",
  },
  emojiSection: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emojiContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  emojiButton: {
    padding: 5,
  },
  emojiText: {
    fontSize: 26,
  },
  optionsSection: {
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  gridContainer: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    width: "100%",
  },
  gridContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  columnWrapper: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  gridItem: {
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    paddingBottom: 10,
    margin: 3.5,
    backgroundColor: "white",
    minWidth: (SCREEN_WIDTH * 0.8 - 20) / 4 - 4,
    maxWidth: (SCREEN_WIDTH * 0.8 - 20) / 4 - 4,
  },
  gridIcon: {
    marginBottom: 5,
  },
  gridText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    width: "100%",
  },
});

export default MessagePopupStyle;
