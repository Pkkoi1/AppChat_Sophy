import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import MessageItemStyle from "../../screens/chat/message/MessageItemStyle";

export function RenderImageMessage({
  attachment,
  isSender,
  navigation,
  errorImage,
  MessageItemStyle: _,
  onLongPress,
}) {
  return (
    <View
      style={[
        MessageItemStyle.mediaOuter,
        isSender
          ? MessageItemStyle.mediaSender
          : MessageItemStyle.mediaReceiver,
        MessageItemStyle.mediaBorder,
      ]}
    >
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("FullScreenImageViewer", {
            imageUrl: attachment.url || errorImage,
          })
        }
        onLongPress={onLongPress}
        delayLongPress={200}
      >
        <Image
          source={{ uri: attachment.url || errorImage }}
          style={MessageItemStyle.image}
        />
      </TouchableOpacity>
    </View>
  );
}
