import React, { useState } from "react";
import { View, TouchableOpacity, Text, Animated } from "react-native";
import {
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome6,
  Feather,
} from "@expo/vector-icons";
import MessageItemStyle from "../MessageItemStyle";

const renderFileIcon = (type = "") => {
  if (type.includes("pdf"))
    return <FontAwesome6 name="file-pdf" size={24} color="#d9534f" />;
  if (type.includes("word"))
    return (
      <MaterialCommunityIcons name="file-word" size={24} color="#007bff" />
    );
  if (type.includes("excel"))
    return (
      <MaterialCommunityIcons name="file-excel" size={24} color="#28a745" />
    );
  if (type.includes("zip"))
    return <FontAwesome5 name="file-archive" size={24} color="#f0ad4e" />;
  return <MaterialIcons name="insert-drive-file" size={24} color="#6c757d" />;
};

export function RenderFileMessage({
  attachment,
  handleDownload,
  MessageItemStyle: _,
}) {
  const [downloading, setDownloading] = useState(false);
  const spinAnim = React.useRef(new Animated.Value(0)).current;

  const handleDownloadPress = async () => {
    setDownloading(true);
    const animation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    );
    animation.start();
    try {
      await handleDownload(
        attachment.url,
        attachment.name || "Tệp tin",
        attachment.downloadUrl
      );
    } finally {
      setDownloading(false);
      animation.stop();
      spinAnim.setValue(0);
    }
  };

  return (
    <View style={MessageItemStyle.fileContainer}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {renderFileIcon(attachment.type || "unknown")}
        <Text style={MessageItemStyle.fileName}>
          {attachment.name || "Tệp tin"}
        </Text>
        <TouchableOpacity
          onPress={handleDownloadPress}
          style={{ marginLeft: 8 }}
          disabled={downloading}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: downloading
                    ? spinAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      })
                    : "0deg",
                },
              ],
            }}
          >
            <Feather
              name={downloading ? "loader" : "download"}
              size={22}
              color="#005ae0"
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
