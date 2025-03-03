import React, { useState } from "react";
import { View } from "react-native";
import { Tab } from "@rneui/themed";
import Friend from "./friend/ListFriends";
import Group from "./group/ListGroups";
import OA from "./officialAccount/ListAccounts";
import IndexStyle from "./IndexStyle"; // Import style mới

const Directory = () => {
  const [index, setIndex] = useState(0);

  // Mảng chứa nội dung tương ứng với từng tab
  const screenComponents = [<Friend />, <Group />, <OA />];

  return (
    <View style={IndexStyle.container}>
      {/* Thanh menu */}
      <Tab
        value={index}
        onChange={setIndex}
        indicatorStyle={IndexStyle.activeItem}
        variant="primary"
        containerStyle={IndexStyle.menubar}
      >
        <Tab.Item
          title="Bạn bè"
          titleStyle={[
            IndexStyle.menuTitle,
            index === 0 && IndexStyle.activeText,
          ]}
        />
        <Tab.Item
          title="Nhóm"
          titleStyle={[
            IndexStyle.menuTitle,
            index === 1 && IndexStyle.activeText,
          ]}
        />
        <Tab.Item
          title="OA"
          titleStyle={[
            IndexStyle.menuTitle,
            index === 2 && IndexStyle.activeText,
          ]}
        />
      </Tab>

      {/* Chỉ hiển thị nội dung theo tab đang chọn */}
      <View style={IndexStyle.tabContainer}>{screenComponents[index]}</View>
    </View>
  );
};

export default Directory;
