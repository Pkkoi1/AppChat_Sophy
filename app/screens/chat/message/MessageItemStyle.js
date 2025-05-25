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
    // Loại bỏ nền cho hình ảnh/video
  },
  sender: {
    backgroundColor: "#d4f1ff",
    alignSelf: "flex-end",
    marginRight: 10,
    borderColor: Color.sophy,
    borderWidth: 0.5,
  },
  receiver: {
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
    borderColor: "#f0f0f0",
    borderWidth: 0.5,
  },
  // Thêm style cho hình/video nằm ngoài messageBox nhưng vẫn căn theo người gửi/nhận
  mediaOuter: {
    marginHorizontal: 10,
    marginVertical: 2,
    alignSelf: "flex-start",
  },
  mediaSender: {
    alignSelf: "flex-end",
    marginRight: 10,
  },
  mediaReceiver: {
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  mediaBorder: {
    borderWidth: 0.5,
    borderColor: Color.sophy,
    borderRadius: 10,
    // padding: 2, // XÓA padding để viền sát hình/video
  },
  timestamp: {
    fontSize: 12,
    color: Color.white,
    marginTop: 5, // Add spacing above the timestamp
    alignSelf: "flex-start", // Align timestamp to the left
    backgroundColor: Color.time, // Nền xám lấy từ Color
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: "hidden",
    marginLeft: 10,
    marginBottom: 2,
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
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: "transparent",
    // Không padding, viền sát hình
  },
  video: {
    width: 200,
    height: 300,
    borderRadius: 8,
    marginTop: 5,
    backgroundColor: "transparent",
    // Không padding, viền sát video
  },
  fileContainer: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginTop: 5,
  },
  fileName: {
    fontSize: 14,
    color: Color.black,
    maxWidth: "80%", // Limit the width to prevent overflow
    overflow: "hidden", // Hide overflowing text
    textOverflow: "ellipsis", // Add ellipsis for long text
    whiteSpace: "nowrap", // Prevent text wrapping
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
    backgroundColor: "#ffffff",
    // padding: 10,
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
