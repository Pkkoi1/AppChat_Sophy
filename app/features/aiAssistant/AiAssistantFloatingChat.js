import React, { useState } from "react";
import aiLogo from "../../../assets/images/AI.png";
import Color from "../../components/colors/Color";

import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AiAssistantChatList from "./AiAssistantChatList";

const AiAssistantFloatingChat = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.fullScreen}>
          <AiAssistantChatList />
          <TouchableOpacity
            style={styles.closeButtonFull}
            onPress={() => setVisible(false)}
          >
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>
      </Modal>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Image
          source={aiLogo}
          style={{ width: 30, height: 30, borderRadius: 19 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 80 : 56,
    right: 4,
    backgroundColor: Color.sophy,
    width: 45,
    height: 45,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    zIndex: 100,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "flex-end",
  },
  closeButtonFull: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#f2f2f2",
    borderRadius: 18,
    padding: 4,
    zIndex: 10,
  },
});

export default AiAssistantFloatingChat;
