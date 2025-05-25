// ...new file...
import React from "react";
import { View, TouchableOpacity, Text, Animated } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Color from "@/app/components/colors/Color";
import MessageItemStyle from "../MessageItemStyle";

export function RenderAudioMessage({
  audioUrl,
  isAudioLoading,
  isAudioPlaying,
  isAudioPaused,
  onPress,
  position,
  duration,
  spinAnim,
}) {
  const formatTime = (millis) => {
    const totalSeconds = Math.floor((millis || 0) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={MessageItemStyle.fileContainer}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TouchableOpacity
          onPress={onPress}
          style={{
            backgroundColor: "#e0e0e0",
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
          disabled={isAudioLoading}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate:
                    isAudioPlaying || isAudioLoading
                      ? spinAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
                        })
                      : "0deg",
                },
              ],
            }}
          >
            {isAudioLoading ? (
              <AntDesign name="loading1" size={24} color={Color.sophy} />
            ) : isAudioPlaying ? (
              <AntDesign name="pausecircle" size={24} color={Color.sophy} />
            ) : (
              <AntDesign name="play" size={24} color={Color.sophy} />
            )}
          </Animated.View>
        </TouchableOpacity>
        <Text style={{ marginLeft: 8, fontSize: 13, minWidth: 48 }}>
          {formatTime(position)} / {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}
