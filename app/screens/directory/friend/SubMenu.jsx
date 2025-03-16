// import React from "react";
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

// import SubMenuStyle from "./SubMenuStyle";

// const subMenuItem = [
//   { name: "Lời mời kết bạn", icon: "user-friends", quantity: 3 },
//   {
//     name: "Danh bạ máy",
//     icon: "address-book",
//     note: "Các liên hệ có dùng Zalo",
//   },
//   { name: "Sinh nhật", icon: "birthday-cake" },
// ];

// const FriendSubMenu = () => {
//   return (
//     <View style={SubMenuStyle.container}>
//       <View style={SubMenuStyle.menubar}>
//         {subMenuItem.map((item, index) => (
//           <TouchableOpacity key={index} style={SubMenuStyle.menubarItem}>
//             <View style={SubMenuStyle.iconTitleContainer}>
//               <View style={SubMenuStyle.iconBackground}>
//                 <FontAwesome5 name={item.icon} size={16} color="#ffffff" />
//               </View>
//               <View style={SubMenuStyle.textContainer}>
//                 <Text style={SubMenuStyle.menuTitle}>
//                   {item.name} {item.quantity && `(${item.quantity})`}
//                 </Text>
//                 {item.note && <Text style={SubMenuStyle.menuNote}>{item.note}</Text>}
//               </View>
//             </View>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </View>
//   );
// };


// export default FriendSubMenu;



import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native"; // Thêm useNavigation

import SubMenuStyle from "./SubMenuStyle";

const subMenuItem = [
  { name: "Lời mời kết bạn", icon: "user-friends", quantity: 3 },
  {
    name: "Danh bạ máy",
    icon: "address-book",
    note: "Các liên hệ có dùng Zalo",
  },
  { name: "Sinh nhật", icon: "birthday-cake" },
];

const FriendSubMenu = () => {
  const navigation = useNavigation(); // Khởi tạo navigation

  const handlePress = (itemName) => {
    if (itemName === "Lời mời kết bạn") {
      navigation.navigate("ReceivedFriendRequests"); // Điều hướng đến ReceivedFriendRequests
    }
  };

  return (
    <View style={SubMenuStyle.container}>
      <View style={SubMenuStyle.menubar}>
        {subMenuItem.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={SubMenuStyle.menubarItem}
            onPress={() => handlePress(item.name)} // Thêm sự kiện onPress
          >
            <View style={SubMenuStyle.iconTitleContainer}>
              <View style={SubMenuStyle.iconBackground}>
                <FontAwesome5 name={item.icon} size={16} color="#ffffff" />
              </View>
              <View style={SubMenuStyle.textContainer}>
                <Text style={SubMenuStyle.menuTitle}>
                  {item.name} {item.quantity && `(${item.quantity})`}
                </Text>
                {item.note && <Text style={SubMenuStyle.menuNote}>{item.note}</Text>}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default FriendSubMenu;