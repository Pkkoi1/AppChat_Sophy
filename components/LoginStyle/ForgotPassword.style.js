import { StyleSheet } from 'react-native';


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