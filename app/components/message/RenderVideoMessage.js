import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Video } from "expo-av";
import MessageItemStyle from "../../screens/chat/message/MessageItemStyle";

export function RenderVideoMessage({
  attachment,
  isSender,
  MessageItemStyle: _,
  onLongPress,
}) {
  // Luôn border cho video
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
      <TouchableOpacity onLongPress={onLongPress} delayLongPress={200}>
        <Video
          source={{ uri: attachment.url }}
          style={MessageItemStyle.video}
          resizeMode="contain"
          useNativeControls
        />
      </TouchableOpacity>
    </View>
  );
}
