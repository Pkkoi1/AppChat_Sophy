import { StyleSheet } from "react-native";

const MessageItemStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start", // Căn avatar theo đầu tin nhắn
    marginVertical: 5,
  },
  senderContainer: {
    justifyContent: "flex-end",
  },
  receiverContainer: {
    justifyContent: "flex-start",
  },
  messageBox: {
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
    position: "relative", // Để avatar có thể nằm trên
  },
  sender: {
    backgroundColor: "#d4f1ff",
    alignSelf: "flex-end",
    marginRight: 10,
  },
  receiver: {
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
  },
  receiverWithAvatar: {
    marginLeft: 40, // Để hộp tin nhắn không quá sát avatar
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
  },
  content: {
    fontSize: 16,
    color: "#000",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 15,
    position: "absolute",
    top: 0,
    marginLeft: 5,
    // left: -35, // Đặt avatar ở góc trên bên trái hộp tin nhắn
  },
});

export default MessageItemStyle;
