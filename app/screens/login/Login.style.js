import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
export default StyleSheet.create({
  safeAreaTop: {
    backgroundColor: "#1b96fd", // Màu xanh của Zalo ở phần trên
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 0,
    paddingTop: 0, // Đảm bảo nội dung sát với header
    marginTop: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1b96fd", // Màu giống Zalo
    height: 60, // Chiều cao header
    paddingHorizontal: 10,
  },
  backButton: {
    fontSize: 30,
    color: "#fff", // Màu trắng cho nút quay lại
    marginLeft: 10, // Khoảng cách từ viền trái
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff", // Màu trắng cho tiêu đề
    paddingLeft: 10,
    fontWeight: "bold",
  },
  subtitleContainer: {
    backgroundColor: "#F0F4F3", // Màu xanh giống header Zalo
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignSelf: "stretch",
  },
  subtitle: {
    fontSize: 14,
    color: "#000",
    textAlign: "left",
  },
  input: {
    height: 50,
    borderBottomColor: "#007AFF",
    borderBottomWidth: 1,
    fontSize: 16,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#007AFF",
    borderBottomWidth: 1,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  showText: {
    fontSize: 16,
    color: "#007AFF",
  },
  forgotPassword: {
    color: "#007AFF",
    marginBottom: 20,
    marginHorizontal: 20,
  },
  faqLinkContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
  },
  faqLink: {
    color: "#666",
  },

  buttonField: {
    position: "absolute",
    bottom: height * 0.02, // Giữ tỷ lệ phần trăm chiều cao
    right: width * 0.05,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#d9eaff",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    shadowColor: "#000", // Hiệu ứng đổ bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Độ nổi trên Android
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 24,
    textAlign: "center",
  },
  nextButtonEnabled: {
    backgroundColor: "#007AFF",
  },
});
