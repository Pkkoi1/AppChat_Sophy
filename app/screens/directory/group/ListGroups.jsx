import React, { useState, useContext, useEffect } from "react";
import { FlatList, RefreshControl, Text, View, ActivityIndicator } from "react-native";
import { Button, Menu, Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import Group from "./Group";
import SubMenu from "./SubMenu";
import ListGroupStyle from "./ListGroupsStyle";
import { AuthContext } from "../../../auth/AuthContext";
import { useNavigation } from "@react-navigation/native";

const ListGroup = () => {
  const [sortCriteria, setSortCriteria] = useState("lastActivity");
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const { groups, groupsLoading, fetchGroups } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch groups when component mounts
    fetchGroups();
  }, []);

  const handlerRefresh = async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
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

  const handleGroupPress = (conversation) => {
    navigation.navigate("Chat", {
      conversation: conversation,
      receiver: null,
    });
  };

  const getSortedGroups = () => {
    if (!groups || groups.length === 0) return [];

    const sortedGroups = [...groups];

    if (sortCriteria === "lastActivity") {
      sortedGroups.sort((a, b) => {
        const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : new Date(0);
        const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : new Date(0);
        return dateB - dateA;
      });
    } else if (sortCriteria === "groupName") {
      sortedGroups.sort((a, b) => (a.groupName || "").localeCompare(b.groupName || ""));
    } else if (sortCriteria === "adminGroups") {
      const userId = groups[0]?.userId;
      sortedGroups.sort((a, b) => {
        const isAdminA = a.groupOwner === userId || (a.groupCoOwners && a.groupCoOwners.includes(userId));
        const isAdminB = b.groupOwner === userId || (b.groupCoOwners && b.groupCoOwners.includes(userId));
        return isAdminB - isAdminA;
      });
    }

    return sortedGroups;
  };

  // Pre-calculate sorted groups
  const sortedGroups = getSortedGroups();
  const hasGroups = sortedGroups.length > 0;

  // Show loading screen
  if (groupsLoading && !refreshing && (!groups || groups.length === 0)) {
    return (
      <View style={ListGroupStyle.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={ListGroupStyle.loadingText}>Đang tải danh sách nhóm...</Text>
      </View>
    );
  }

  // Prepare data for FlatList
  const listData = [
    { isSubMenu: true, id: "submenu" },
    { isSortHeader: true, id: "sortHeader" },
    ...sortedGroups.map(group => ({ ...group, id: group.conversationId || `group-${group._id}` }))
  ];

  // Render empty state
  const renderEmptyComponent = () => {
    if (!hasGroups) {
      return (
        <View style={ListGroupStyle.emptyContainer}>
          <Text style={ListGroupStyle.emptyText}>Bạn chưa tham gia nhóm nào</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={ListGroupStyle.container}>
      <FlatList
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handlerRefresh} />
        }
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.isSubMenu) {
            return <SubMenu />;
          }

          if (item.isSortHeader) {
            return (
              <View style={ListGroupStyle.header}>
                <Text style={ListGroupStyle.memberCount}>
                  Nhóm đang tham gia ({sortedGroups.length})
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
                      titleStyle={ListGroupStyle.menuItem}
                    />
                  ))}
                  <Divider style={ListGroupStyle.menuDivider} />
                </Menu>
              </View>
            );
          }

          // For each group item
          return (
            <Group
              name={item.groupName}
              avatar={item.groupAvatarUrl}
              message={item.lastMessage?.content || ""}
              date={item.lastMessage?.createdAt || ""}
              onPress={() => handleGroupPress(item)}
            />
          );
        }}
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
};

export default ListGroup;