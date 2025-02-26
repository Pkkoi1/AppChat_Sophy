// import React, { useState } from "react";
// import { AntDesign } from "@expo/vector-icons";
// import { TextInput, View, TouchableOpacity } from "react-native";
// import HeaderStyle from "./HeaderStyle";

// const HeadView = (footer_option) => {
//   const [search, setSearch] = useState("");

//   return (
//     <View style={HeaderStyle().container}>
//       <TouchableOpacity>
//         <AntDesign name="search1" size={24} color="white" />
//       </TouchableOpacity>

//       <TextInput
//         style={HeaderStyle().searchInput}
//         placeholder="Tìm kiếm"
//         placeholderTextColor="#ddd"
//         value={search}
//         onChangeText={setSearch}
//       />

//       <TouchableOpacity>
//         <AntDesign name="qrcode" size={24} color="white" />
//       </TouchableOpacity>

//       <TouchableOpacity>
//         <AntDesign name="plus" size={24} color="white" />
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default HeadView;


import React, { useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import { TextInput, View, TouchableOpacity } from "react-native";
import HeaderStyle from "./HeaderStyle";

const HeadView = ({ page }) => {
  const [search, setSearch] = useState("");

  return (
    <View style={HeaderStyle().container}>
      <TouchableOpacity>
        <AntDesign name="search1" size={24} color="white" />
      </TouchableOpacity>

      <TextInput
        style={HeaderStyle().searchInput}
        placeholder="Tìm kiếm"
        placeholderTextColor="#ddd"
        value={search}
        onChangeText={setSearch}
      />

      {/* Hiển thị QR code và plus cho trang Inbox */}
      {page === "Inbox" && (
        <>
          <TouchableOpacity>
            <AntDesign name="qrcode" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <AntDesign name="plus" size={24} color="white" />
          </TouchableOpacity>
        </>
      )}

      {/* Hiển thị setting cho trang Cá nhân */}
      {page === "Profile" && (
        <TouchableOpacity>
          <AntDesign name="setting" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default HeadView;
