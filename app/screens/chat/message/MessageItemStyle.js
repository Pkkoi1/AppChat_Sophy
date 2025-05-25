import { StyleSheet } from "react-native";
import Color from "@/app/components/colors/Color";

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
    marginLeft: 100, // Để hộp tin nhắn không quá sát avatar
    borderColor: Color.sophy,
    borderWidth: 0.5,
  },
  mediaOuter: {
    borderRadius: 8,
    overflow: "hidden", // Để bo góc các media
    marginLeft: 10, // Để hộp tin nhắn không quá sát avatar
    marginRight: 10, // Để hộp tin nhắn không quá sát avatar
  },
  receiver: {
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
    borderColor: "#f0f0f0",
    borderWidth: 0.5,
    marginRight: 100,
    borderColor: Color.sophy,
    borderWidth: 0.5,
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
  timestampText: {
    color: Color.grayText,
    fontSize: 12,
    textAlign: "center", // Center the text within the timestamp
    width: "100%", // Ensure the timestamp takes full width
    // textAlign: "left", // Align text to the left
  },
  content: {
    fontSize: 16,
    color: Color.black,
    padding: 0,
    margin: 0,
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
    width: 200,
    height: 300,
    resizeMode: "contain",
    borderRadius: 8,
    marginVertical: 10,
    alignSelf: "flex-start",
    marginRight: 10,
    marginLeft: 10,
    // Không border ở đây, border sẽ được thêm ở mediaBorder nếu cần
  },
  mediaBorder: {
    borderColor: Color.sophy,
    borderWidth: 0.5,
    borderRadius: 8,
  },
  video: {
    width: 200,
    height: 300,
    borderRadius: 8,
    marginTop: 5,
    marginRight: 10,
    marginLeft: 10,
    // Không border ở đây, border sẽ được thêm ở mediaBorder nếu cần
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
    backgroundColor: Color.sophy,
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
    borderLeftColor: Color.sophy,
    paddingLeft: 10,
    marginBottom: 5,
    maxWidth: 220, // Giới hạn tối đa chiều rộng
    width: 220, // Để kích thước phụ thuộc vào nội dung
    alignSelf: "flex-start",
  },
  replySender: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#555",
  },
  replyContent: {
    fontSize: 12,
    color: "#555",
    flexShrink: 1,
    flexWrap: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  notificationContainer: {
    alignSelf: "center", // Center the notification horizontally
    backgroundColor: "#ffffff",
    paddingHorizontal: 5,
    borderRadius: 50,
    marginVertical: 10,
  },
  notificationText: {
    fontSize: 10,
    color: "#555",
    textAlign: "center", // Center the text within the container
  },
});

export default MessageItemStyle;
