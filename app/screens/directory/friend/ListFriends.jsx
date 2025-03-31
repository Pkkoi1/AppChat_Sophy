import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import FriendSubMenu from "./SubMenu";
import Friends from "./Friend";
import friendsList from "../../../../assets/objects/user.json";
import ListFriendStyle from "./ListFriendStyle";

const ListFriends = () => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation(); // Initialize navigation

  const handlerRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const renderHeader = () => (
    <View style={ListFriendStyle.container}>
      <FriendSubMenu />
      <View style={ListFriendStyle.buttonContainer}>
        <TouchableOpacity
          style={[ListFriendStyle.buttonTab, ListFriendStyle.buttonAll]}
        >
          <View style={ListFriendStyle.buttonContent}>
            <Text>Tất cả</Text>
            <Text>230</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[ListFriendStyle.buttonTab, ListFriendStyle.buttonNew]}
        >
          <Text>Mới truy cập</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Sắp xếp danh sách theo chữ cái đầu của name
  const sortedFriends = friendsList.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Nhóm bạn bè theo chữ cái đầu tiên của tên
  const groupedFriends = sortedFriends.reduce((acc, friend) => {
    const firstLetter = friend.name[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(friend);
    return acc;
  }, {});

  return (
    <View>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={Object.keys(groupedFriends)}
        keyExtractor={(item) => item}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handlerRefresh} />
        }
        renderItem={({ item }) => (
          <View style={ListFriendStyle.listFriendContainer}>
            <Text style={ListFriendStyle.categoryTitle}>{item}</Text>
            {groupedFriends[item].map((friend) => (
              <TouchableOpacity key={friend.id} onPress={() => navigation.navigate('UserProfile', { id: friend.id })}>
                <Friends friend={friend} />
              </TouchableOpacity>
            ))}
          </View>
        )}
        contentContainerStyle={ListFriendStyle.container}
      />
    </View>
  );
};

export default ListFriends;