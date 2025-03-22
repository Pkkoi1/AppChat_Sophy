import React from "react";
import { SafeAreaView } from "react-native";
import ChatHeader from "../chat/header/ChatHeader";

const TestScreen = ({ route, navigation }) => {
  const { conversation_id, user_id, receiverId } = route.params;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ChatHeader
        receiver={receiverId}
        groupName={""}
        participants={[]}
        isGroup={false}
        user_id={"67d3f8a5e378dd826edb22ca"}
        conversation_id={"conv1"}
        navigation={navigation} // Truyền navigation xuống
      />
    </SafeAreaView>
  );
};

export default TestScreen;
