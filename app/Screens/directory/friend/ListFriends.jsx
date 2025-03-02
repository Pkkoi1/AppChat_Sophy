import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import FriendSubMenu from "./subMenu";
import Friends from "./Friend";
import friendsList from "../../../../assets/objects/user.json";

const ListFriends = () => {
  const renderHeader = () => (
    <View style={styles.container}>
      <FriendSubMenu />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.buttonTab, styles.buttonAll]}>
          <View style={styles.buttonContent}>
            <Text>Tất cả</Text>
            <Text>230</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonTab, styles.buttonNew]}>
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
        renderItem={({ item }) => (
          <View style={styles.listFriendContainer}>
            <Text style={styles.categoryTitle}>{item}</Text>
            {groupedFriends[item].map((friend) => (
              <Friends key={friend.id} friend={friend} />
            ))}
          </View>
        )}
        contentContainerStyle={styles.container}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
    marginTop: 10,
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 0.5,
    padding: 10,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  buttonTab: {
    textAlign: "center",
    width: 100,
    height: 28,
    backgroundColor: "#ddd",
    borderRadius: 18,
    padding: 5,
    paddingHorizontal: 10,
  },
  buttonAll: {
    marginRight: 10,
  },
  buttonNew: {},
  friendList: {
    display: "flex",
    flexDirection: "column",
  },
  buttonContent: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    textAlign: "center",
  },
  friendTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  listFriendContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#ffffff",
  },
});

export default ListFriends;
