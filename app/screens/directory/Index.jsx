import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native"; // Import ActivityIndicator
import { Tab } from "@rneui/themed";
import Friend from "./friend/ListFriends";
import Group from "./group/ListGroups";
import OA from "./officialAccount/ListAccounts";
import IndexStyle from "./IndexStyle";
import Color from "../../components/colors/Color"; // Import Color

const Directory = () => {
  const [index, setIndex] = useState(0);
  const [tabKey, setTabKey] = useState(0); // Key để ép Tab render lại
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    console.log("[Directory] useEffect [] called");
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
      console.log("[Directory] setLoading(false)");
    }, 1000); // Adjust the timeout as needed
    setTabKey((prevKey) => {
      console.log("[Directory] setTabKey", prevKey + 1);
      return prevKey + 1;
    }); // Thay đổi key để Tab render lại từ đầu
  }, []);

  useEffect(() => {
    console.log(
      "[Directory] render, index:",
      index,
      "tabKey:",
      tabKey,
      "loading:",
      loading
    );
  });

  const screenComponents = [<Friend />, <Group />, <OA />];

  return (
    <View style={IndexStyle.container}>
      {loading ? ( // Display loading indicator
        <View style={IndexStyle.loadingContainer}>
          <ActivityIndicator size="large" color={Color.blueBackgroundButton} />
        </View>
      ) : (
        <>
          <Tab
            key={tabKey} // Thêm key để ép Tab render lại
            value={index}
            onChange={(i) => {
              console.log("[Directory] Tab onChange", i);
              setIndex(i);
            }}
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
        </>
      )}
    </View>
  );
};

export default Directory;