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
    marginVertical: 2,
    marginHorizontal: 10,
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
    // marginLeft: 45, // Để hộp tin nhắn không quá sát avatar
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 5, // Add spacing above the timestamp
    alignSelf: "flex-start", // Align timestamp to the left
  },
  content: {
    fontSize: 16,
    color: "#000",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 15,
    // position: "absolute",
    top: 0,
    zIndex: 5, // Để avatar nằm trên hộp tin nhắn
    marginLeft: 5,
    left: 0, // Đặt avatar ở góc trên bên trái hộp tin nhắn
  },
  highlighted: {
    backgroundColor: "#d1e7ff", // Màu nền xanh nhạt
    borderRadius: 8, // Bo góc
    padding: 5, // Thêm khoảng cách bên trong
  },
  senderName: {
    fontSize: 12,
    fontWeight: "450",
    color: "#555",
    marginBottom: 4,
  },
  image: {
    width: 250,
    height: 180,
    borderRadius: 8,
    marginVertical: 10,
    alignSelf: "center", // Center the image outside the bubble
  },
  fileContainer: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginTop: 5,
  },
  fileName: {
    fontSize: 14,
    color: "#007bff",
  },
  video: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginTop: 5,
  },
  videoLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  unsupported: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
});

export default MessageItemStyle;
