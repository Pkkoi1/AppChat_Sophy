import React, { useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { Button, Menu, Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import Group from "./Group";
import SubMenu from "./SubMenu";
import ListGroupStyle from "./ListGroupsStyle";
import Groups from "../../../../assets/objects/group.json";

const ListGroup = () => {
  const [sortCriteria, setSortCriteria] = useState("lastActivity");
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handlerRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const options = [
    { label: "Hoạt động cuối", value: "lastActivity" },
    { label: "Tên nhóm (A-Z)", value: "groupName" },
    { label: "Nhóm quản lý", value: "adminGroups" },
  ];

  const handleSortSelection = (value) => {
    setSortCriteria(value);
    setMenuVisible(false);
  };

  // Hàm sắp xếp danh sách nhóm
  const getSortedGroups = () => {
    let sortedGroups = [...Groups];

    if (sortCriteria === "lastActivity") {
      sortedGroups.sort((a, b) => {
        const lastMessageA = a.messages?.[a.messages.length - 1]?.timestamp;
        const lastMessageB = b.messages?.[b.messages.length - 1]?.timestamp;
        return (
          (lastMessageB ? Date.parse(lastMessageB) : 0) -
          (lastMessageA ? Date.parse(lastMessageA) : 0)
        );
      });
    } else if (sortCriteria === "groupName") {
      sortedGroups.sort((a, b) => a.groupName.localeCompare(b.groupName));
    }

    return sortedGroups;
  };

  return (
    <View style={ListGroupStyle.container}>
      <FlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handlerRefresh} />
        }
        data={[
          { isSubMenu: true },
          { isSortHeader: true },
          ...getSortedGroups(),
        ]}
        keyExtractor={(item, index) =>
          item.isSubMenu
            ? "submenu"
            : item.isSortHeader
            ? "sortHeader"
            : item.groupId || `group-${index}`
        }
        renderItem={({ item }) => {
          if (item.isSubMenu) {
            return <SubMenu />;
          }

          if (item.isSortHeader) {
            return (
              <View style={ListGroupStyle.header}>
                <Text style={ListGroupStyle.memberCount}>
                  Nhóm đang tham gia ({Groups.length})
                </Text>

                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <Button
                      mode="text"
                      onPress={() => setMenuVisible(true)}
                      style={ListGroupStyle.sortButton}
                      icon={() => (
                        <MaterialIcons name="sort" size={16} color="#929598" />
                      )}
                    >
                      <Text style={ListGroupStyle.sortText}>
                        {options.find((o) => o.value === sortCriteria)?.label}
                      </Text>
                    </Button>
                  }
                >
                  {options.map((option, index) => (
                    <Menu.Item
                      key={index}
                      onPress={() => handleSortSelection(option.value)}
                      title={option.label}
                      titleStyle={ListGroupStyle.menuItem} // Áp dụng màu chữ menu
                    />
                  ))}
                  <Divider style={ListGroupStyle.menuDivider} />
                </Menu>
              </View>
            );
          }

          const latestMessage = item.messages?.[item.messages.length - 1];

          return (
            <Group
              name={item.groupName}
              avatar={item.groupAvatar}
              message={latestMessage?.text || ""}
              date={latestMessage?.timestamp || ""}
            />
          );
        }}
      />
    </View>
  );
};

export default ListGroup;
