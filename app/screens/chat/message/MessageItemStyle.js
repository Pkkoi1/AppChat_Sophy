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
    maxWidth: "90%", // Increase maxWidth to ensure space for the sender's name
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
    width: "100%", // Ensure the sender's name does not overflow
  },
  image: {
    width: "200", // Make the image width relative to the chat box
    height: "300", // Allow proportional scaling
    // aspectRatio: 16 / 9, // Maintain a 4:3 aspect ratio
    borderRadius: 8,
    marginVertical: 10,
    alignSelf: "flex-start", // Align the image within the bubble
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
    marginLeft: 10, // Add spacing between icon and text
    maxWidth: "80%", // Limit the width to prevent overflow
    overflow: "hidden", // Hide overflowing text
    textOverflow: "ellipsis", // Add ellipsis for long text
    whiteSpace: "nowrap", // Prevent text wrapping
  },
  video: {
    width: 200,
    height: 300,
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
  statusContainer: {
    marginTop: 4,
    alignItems: "flex-end",
  },
  statusText: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    alignItems: "flex-end",
  },
  newText: {
    marginTop: 5, // Add spacing above the status text
    alignSelf: "flex-end", // Align to the right for sender messages
    marginRight: 10, // Add spacing from the right edge
  },
  downloadButton: {
    marginTop: 5,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignItems: "center",
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  recalledMessage: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#999",
    textAlign: "center",
    width: "100%",
    paddingRight: 15,
    justifyContent: "center",
  },
  replyContainer: {
    borderLeftWidth: 2,
    borderLeftColor: "#007bff",
    paddingLeft: 10,
    marginBottom: 5,
  },
  replySender: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#555",
  },
  replyContent: {
    fontSize: 12,
    color: "#555",
  },
  notificationContainer: {
    alignSelf: "center", // Center the notification horizontally
    backgroundColor: "#f0f0f0",
    // padding: 10,
    paddingHorizontal: 5,
    borderRadius: 50,
    marginVertical: 10,
  },
  notificationText: {
    fontSize: 13,
    color: "#555",
    textAlign: "center", // Center the text within the container
  },
});

export default MessageItemStyle;
