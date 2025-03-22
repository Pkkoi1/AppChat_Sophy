// import React from "react";
// import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import Feather from "@expo/vector-icons/Feather";
// import { LinearGradient } from "expo-linear-gradient";
// import { useNavigation } from "expo-router";

// const ChatHeader = ({
//   receiver,
//   groupName,
//   participants,
//   isGroup,
//   user_id,
//   conversation_id,
//   onSearchPress,
// }) => {
//   const navigation = useNavigation();

//   const handlerBack = () => {
//     navigation.goBack();
//   };

//   const handlerOptionScreen = () => {
//     if (!receiver || !groupName) {
//       console.warn("receiver hoặc groupName không hợp lệ");
//       return;
//     }
//     navigation.navigate("Options", {
//       receiver,
//       groupName,
//       participants,
//       isGroup,
//       user_id,
//       conversation_id,
//     });
//   };

//   return (
//     <LinearGradient
//       colors={["#1f7bff", "#12bcfa"]}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 0 }}
//       style={ChatHeaderStyle.container}
//     >
//       <TouchableOpacity onPress={handlerBack}>
//         <Ionicons name="arrow-back" size={24} color="#ffffff" />
//       </TouchableOpacity>
//       <View style={ChatHeaderStyle.conversationName}>
//         <Text
//           style={ChatHeaderStyle.text}
//           numberOfLines={1}
//           ellipsizeMode="tail"
//         >
//           {groupName || receiver?.name || "Họ Tên"}
//         </Text>
//         <Text style={ChatHeaderStyle.subText}>
//           {groupName ? `${participants.length} thành viên` : "Vừa mới truy cập"}
//         </Text>
//       </View>
//       <TouchableOpacity>
//         <Feather name="phone" size={24} color="#ffffff" />
//       </TouchableOpacity>
//       <TouchableOpacity>
//         <Ionicons name="videocam-outline" size={24} color="#ffffff" />
//       </TouchableOpacity>
//       <TouchableOpacity onPress={handlerOptionScreen}>
//         <Ionicons name="menu-outline" size={24} color="#ffffff" />
//       </TouchableOpacity>
//     </LinearGradient>
//   );
// };

// const ChatHeaderStyle = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     margin: 0,
//     width: "100%",
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     backgroundColor: "#fff",
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 5,
//     },
//     shadowOpacity: 0.1,
//     elevation: 5,
//   },
//   conversationName: {
//     width: "45%",
//     flexDirection: "column",
//     justifyContent: "center",
//     alignItems: "flex-start",
//     marginLeft: 0,
//   },
//   text: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   subText: {
//     color: "#fff",
//     fontSize: 12,
//   },
// });

// export default ChatHeader;
import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";

const ChatHeader = ({ user_id }) => {
  return (
    <LinearGradient
      colors={["#1f7bff", "#12bcfa"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={ChatHeaderStyle.container}
    >
      <TouchableOpacity>
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>
      <View style={ChatHeaderStyle.conversationName}>
        <Text
          style={ChatHeaderStyle.text}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {/* {receiver?.id || "Không có ID"} Hiển thị receiver.id */}
          {user_id}
          Khôi
        </Text>
        <Text style={ChatHeaderStyle.subText}>Vừa mới truy cập</Text>
      </View>
      <TouchableOpacity>
        <Feather name="phone" size={24} color="#ffffff" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="videocam-outline" size={24} color="#ffffff" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Ionicons name="menu-outline" size={24} color="#ffffff" />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const ChatHeaderStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 0,
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    elevation: 5,
  },
  conversationName: {
    width: "45%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    marginLeft: 0,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  subText: {
    color: "#fff",
    fontSize: 12,
  },
});

export default ChatHeader;
