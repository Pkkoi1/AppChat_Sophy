import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    backArrow: {
      fontSize: 24,
      color: "#007AFF",
      marginRight: 10,
    },
    headerText: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#007AFF",
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#007AFF',  // Màu giống Zalo
      height: 60, // Chiều cao header
      paddingHorizontal: 10,
    },
    backButton: {
      fontSize: 30,
      color: '#fff',  // Màu trắng cho nút quay lại
      marginLeft: 10,  // Khoảng cách từ viền trái
      marginBottom: 5,
    },
    headerTitle: {
      fontSize: 18,
      color: '#fff',  // Màu trắng cho tiêu đề
      paddingLeft: 10,
      fontWeight: 'bold',
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
      borderBottomColor: "#007AFF",
      borderBottomWidth: 1,
      fontSize: 16,
      marginHorizontal: 20,
    },
    nextButton: {
      position: 'absolute',
      bottom: height * 0.02, // Dùng tỷ lệ phần trăm của chiều cao màn hình
      right: width * 0.05, // Dùng tỷ lệ phần trăm của chiều rộng màn hình
      backgroundColor: '#d9eaff', // Màu xanh đồng nhất
      borderRadius: 30, // Tạo nút tròn hoàn hảo
      width: 50, // Kích thước chiều rộng
      height: 50, // Kích thước chiều cao
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
      textAlign: 'center', // Căn giữa nội dung ngang
      position: 'relative', // Đặt văn bản ở vị trí tuyệt đối trong nút
      top: '50%', // Căn giữa theo chiều dọc
      left: '50%', // Căn giữa theo chiều ngang
      transform: [{ translateX: -25 }, { translateY: -25 }]
    },
  });