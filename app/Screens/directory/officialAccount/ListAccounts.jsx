import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Button, Menu, Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import Account from "./Account";
import SubMenu from "./SubMenu";
import ListAccountsStyle from "./ListAccountStyle";
import accountsData from "../../../../assets/objects/account.json";

const ListAccounts = () => {
  const [sortCriteria, setSortCriteria] = useState("followers");
  return (
    <View style={ListAccountsStyle.container}>
      <FlatList
        data={[{ isSubMenu: true }, { isSortHeader: true }, ...accountsData]}
        renderItem={({ item }) => {
          if (item.isSubMenu) {
            return <SubMenu />;
          }

          if (item.isSortHeader) {
            return (
              <View style={ListAccountsStyle.header}>
                <Text style={ListAccountsStyle.accountCount}>
                  Account đã quan tâm ({accountsData.length})
                </Text>
              </View>
            );
          }

          return <Account account={item} />;
        }}
      />
    </View>
  );
};

export default ListAccounts;
