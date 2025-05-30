import React from "react";
import { View, TouchableOpacity, Image, Text } from "react-native";
import MessageItemStyle from "../../screens/chat/message/MessageItemStyle";

export function RenderTextWithImageMessage({
  content,
  imageUrl,
  navigation,
  MessageItemStyle: _,
}) {
  return (
    <>
      {content ? (
        <View>
          <Text style={MessageItemStyle.content}>{content}</Text>
        </View>
      ) : null}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("FullScreenImageViewer", {
            imageUrl: imageUrl,
          })
        }
      >
        <Image source={{ uri: imageUrl }} style={MessageItemStyle.image} />
      </TouchableOpacity>
    </>
  );
}
