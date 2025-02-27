// import React, { useState } from "react";
// import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView } from "react-native";
// import { AntDesign, MaterialIcons } from "@expo/vector-icons";  // Thêm các biểu tượng từ expo
// import Footer from "../Footer/Footer";
// import HeadView from "../Header/Header"; // Giả sử HeadView là header của bạn

// // Dữ liệu mục với nhóm và các icon hợp lệ
// const data = [
//   { title: "Thành Nghiêm", description: "Xem trang cá nhân của bạn", icon: "user", group: 0 }, // Thay thế user bằng user1

//   // Nhóm 1
//   { title: "zCloud", description: "Không gian lưu trữ dữ liệu trên đám mây", icon: "cloud", group: 1 },
//   { title: "zStyle - Nổi bật trên Zalo", description: "Hình nền và nhạc cho cuộc gọi Zalo", icon: "playcircleo", group: 2 },

//   // Nhóm 2
//   { title: "Cloud của tôi", description: "Lưu trữ các tin nhắn quan trọng", icon: "cloud", group: 3 },
//   { title: "Dữ liệu trên máy", description: "Quản lý dữ liệu Zalo của bạn", icon: "save", group: 4 },
//   { title: "Ví QR", description: "Lưu trữ và xuất trình các mã QR quan trọng", icon: "qrcode", group: 5 },

//   // Nhóm 3
//   { title: "Tài khoản và bảo mật", description: "Quản lý tài khoản và bảo mật", icon: "lock", group: 6 },
//   { title: "Quyền riêng tư", description: "Cài đặt quyền riêng tư của bạn", icon: "security", group: 7 }, // Thay thế shield bằng security
// ];

// const UserProfileScreen = () => {
//   const [currentScreen, setCurrentScreen] = useState("Inbox");

//   return (
//     <SafeAreaView style={styles.safeAreaView}>
//       <View style={styles.container}>
//         {/* Header */}
//         <HeadView style={styles.header} />

//         {/* Danh sách các mục */}
//         <FlatList
//           data={data}
//           keyExtractor={(item) => item.title}
//           renderItem={({ item }) => (
//             <TouchableOpacity style={[styles.item, styles[`group${item.group}`]]}>
//               <View style={styles.itemContent}>
//                 <View style={styles.iconWrapper}>
//                   {/* Biểu tượng cho từng mục */}
//                   {item.icon === "security" ? (
//                     <MaterialIcons name="security" size={24} color="blue" />
//                   ) : (
//                     <AntDesign name={item.icon} size={24} color="blue" />
//                   )}
//                 </View>
//                 <View style={styles.textWrapper}>
//                   <Text style={styles.itemTitle}>{item.title}</Text>
//                   <Text style={styles.itemDescription}>{item.description}</Text>
//                 </View>
//               </View>
//               <AntDesign name="right" size={16} color="#000" />
//             </TouchableOpacity>
//           )}
//         />
//         <Footer setCurrentScreen={setCurrentScreen} />
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeAreaView: {
//     flex: 1,
//     backgroundColor: "#fff", // Màu nền của SafeAreaView giống footer
    
// },
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   header: {
//     backgroundColor: "#1b96fd", // Màu giống Zalo
//     paddingTop: 20, // Khoảng cách phía trên cho header
//     paddingBottom: 10, // Khoảng cách phía dưới cho header
//   },
//   item: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderBottomWidth: 1,
//     borderBottomColor: "#ccc",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//   },
//   itemContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   iconWrapper: {
//     marginRight: 15, // Khoảng cách giữa biểu tượng và nội dung
//   },
//   textWrapper: {
//     flex: 1,
//     paddingLeft: 15,
//   },
//   itemTitle: {
//     fontSize: 16,
//     fontWeight: "500",
//   },
//   itemDescription: {
//     fontSize: 12,
//     color: "#777",
//   },
//   group0: {
//     borderBottomWidth: 10,
//     borderBlockColor: "#f0f0f0",
//   },
//   group2: {
//     borderBottomWidth: 10,
//     borderBlockColor: "#f0f0f0",
//   },
//   group5: {
//     borderBottomWidth: 10,
//     borderBlockColor: "#f0f0f0",
//   },
//   group7: {
//     borderBottomWidth: 1000,
//     borderBlockColor: "#f0f0f0",
//   },
// });

// export default UserProfileScreen;

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView } from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";  // Đảm bảo thêm các biểu tượng từ expo
import Footer from "../Footer/Footer";
import HeadView from "../Header/Header"; // Giả sử HeadView là header của bạn

// Dữ liệu mục với nhóm và các icon hợp lệ
const data = [
  { title: "Khôi Nghiêm", description: "Xem trang cá nhân của bạn", icon: "user", group: 0 }, // Sử dụng icon user thay vì hình ảnh

  // Nhóm 1
  { title: "zCloud", description: "Không gian lưu trữ dữ liệu trên đám mây", icon: "cloud", group: 1 },
  { title: "zStyle - Nổi bật trên Zalo", description: "Hình nền và nhạc cho cuộc gọi Zalo", icon: "playcircleo", group: 2 },

  // Nhóm 2
  { title: "Cloud của tôi", description: "Lưu trữ các tin nhắn quan trọng", icon: "cloud", group: 3 },
  { title: "Dữ liệu trên máy", description: "Quản lý dữ liệu Zalo của bạn", icon: "save", group: 4 },
  { title: "Ví QR", description: "Lưu trữ và xuất trình các mã QR quan trọng", icon: "qrcode", group: 5 },

  // Nhóm 3
  { title: "Tài khoản và bảo mật", description: "Quản lý tài khoản và bảo mật", icon: "lock", group: 6 },
  { title: "Quyền riêng tư", description: "Cài đặt quyền riêng tư của bạn", icon: "security", group: 7 }, // Thay thế shield bằng security
];

const UserProfileScreen = () => {
  const [currentScreen, setCurrentScreen] = useState("Inbox");
  const [refreshing, setRefreshing] = useState(false);  // State để điều khiển pull-to-refresh

  // Hàm xử lý việc kéo giãn để refresh
  const onRefresh = () => {
    setRefreshing(true);
    // Thực hiện các thao tác refresh dữ liệu (thay vì setTimeout bạn có thể gọi API hoặc refresh dữ liệu)
    setTimeout(() => {
      setRefreshing(false);  // Sau khi hoàn thành việc refresh, reset refreshing
    }, 2000); // Ví dụ delay 2 giây
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Phần trên với màu xanh */}
      <SafeAreaView style={styles.safeAreaTop}>
        <HeadView style={styles.header} page="Profile" />
      </SafeAreaView>

      {/* Phần nội dung chính */}
      <View style={styles.container}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.item, styles[`group${item.group}`]]}>
              <View style={styles.itemContent}>
                <View style={styles.iconWrapper}>
                  {/* Nếu là "Thành Nghiêm" thì sử dụng icon người với vòng tròn */}
                  {item.title === "Khôi Nghiêm" ? (
                    <View style={styles.iconCircle}>
                      <AntDesign name="user" size={24} color="blue" />
                    </View>
                  ) : (
                    // Các mục khác sử dụng icon bình thường với vòng tròn
                    item.icon === "security" ? (
                      <View>
                        <MaterialIcons name="security" size={24} color="blue" />
                      </View>
                    ) : (
                      <View>
                        <AntDesign name={item.icon} size={24} color="blue" />
                      </View>
                    )
                  )}
                </View>
                <View style={styles.textWrapper}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>
              </View>
              <AntDesign name="right" size={16} color="#000" />
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Phần dưới với màu trắng */}
      <SafeAreaView style={styles.safeAreaBottom}>
        <Footer setCurrentScreen={setCurrentScreen} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaTop: {
    backgroundColor: "#1b96fd", // Màu xanh của Zalo ở phần trên
  },
  safeAreaBottom: {
    backgroundColor: "#fff", // Màu trắng cho phần dưới
  },
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  header: {
    backgroundColor: "#1b96fd", // Màu giống Zalo cho header
    paddingTop: 20,
    paddingBottom: 10,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff", // Màu nền cho mỗi mục
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrapper: {
    marginRight: 15, // Khoảng cách giữa biểu tượng và nội dung
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 55, // Tạo vòng tròn
    backgroundColor: "#f0f0f0", // Màu nền cho vòng tròn
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: "-10",
  },
  textWrapper: {
    flex: 1,
    paddingLeft: 15,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemDescription: {
    fontSize: 12,
    color: "#777",
  },
  group0: {
    borderBottomWidth: 10,
    borderBlockColor: "#f0f0f0",
  },
  group2: {
    borderBottomWidth: 10,
    borderBlockColor: "#f0f0f0",
  },
  group5: {
    borderBottomWidth: 10,
    borderBlockColor: "#f0f0f0",
  },
  group7: {
    borderBottomWidth: 70,
    borderBlockColor: "#f0f0f0",
  },
});

export default UserProfileScreen;
