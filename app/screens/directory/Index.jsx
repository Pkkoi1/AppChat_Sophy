import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Tab } from "@rneui/themed";
import Friend from "./friend/ListFriends";
import Group from "./group/ListGroups";
import OA from "./officialAccount/ListAccounts";
import IndexStyle from "./IndexStyle";

const Directory = () => {
  const [index, setIndex] = useState(0);
  const [tabKey, setTabKey] = useState(0); // Key để ép Tab render lại

  useEffect(() => {
    setTabKey((prevKey) => prevKey + 1); // Thay đổi key để Tab render lại từ đầu
  }, []);

  const screenComponents = [<Friend />, <Group />, <OA />];

  return (
    <View style={IndexStyle.container}>
      <Tab
        key={tabKey} // Thêm key để ép Tab render lại
        value={index}
        onChange={setIndex}
        indicatorStyle={{
          backgroundColor: "#0767fd",
          height: 3,
        }}
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

      <View style={IndexStyle.tabContainer}>{screenComponents[index]}</View>
    </View>
  );
};

export default Directory;
