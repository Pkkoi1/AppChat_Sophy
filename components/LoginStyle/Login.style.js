import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 0,
    paddingTop: 0, // Đảm bảo nội dung sát với header
    marginTop: 0,
  },
  subtitleContainer: {
    backgroundColor: '#F0F4F3', // Màu xanh giống header Zalo
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignSelf: 'stretch',
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    textAlign: 'left',
  },
  input: {
    height: 50,
    borderBottomColor: '#007AFF',
    borderBottomWidth: 1,
    fontSize: 16,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#007AFF',
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
    color: '#007AFF',
  },
  forgotPassword: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  faqLinkContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  faqLink: {
    color: '#666',
  },
  nextButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#d9eaff', // Màu xanh đồng nhất
    borderRadius: 30, // Tạo nút tròn hoàn hảo
    width: 60, // Kích thước chiều rộng
    height: 60, // Kích thước chiều cao
    alignItems: 'center', // Căn giữa nội dung ngang
    justifyContent: 'center', // Căn giữa nội dung dọc
    shadowColor: '#000', // Tạo hiệu ứng đổ bóng
    shadowOffset: { width: 0, height: 2 }, // Hướng bóng
    shadowOpacity: 0.2, // Độ mờ của bóng
    shadowRadius: 4, // Độ lan tỏa bóng
    elevation: 5, // Độ nổi trên Android
  },
  nextButtonText: {
    fontSize: 28, // Tăng kích thước chữ
    fontWeight: 'bold', // Chữ đậm hơn
    color: '#fff', // Chữ màu trắng
  },
});
