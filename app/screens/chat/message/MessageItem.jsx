import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
  Animated,
  Easing,
} from "react-native";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { Audio } from "expo-av";
import MessageItemStyle from "./MessageItemStyle";
import HighlightText from "../../../components/highlightText/HighlightText";
import AvatarUser from "@/app/components/profile/AvatarUser";
import { fetchUserInfo } from "@/app/components/getUserInfo/UserInfo";
import * as Sharing from "expo-sharing";
import { AuthContext } from "@/app/auth/AuthContext";
import { useNavigateToProfile } from "@/app/utils/profileNavigation";
import AntDesign from "@expo/vector-icons/AntDesign";
import Color from "@/app/components/colors/Color";
import { RenderImageMessage } from "../../../components/message/RenderImageMessage";
import { RenderVideoMessage } from "../../../components/message/RenderVideoMessage";
import { RenderAudioMessage } from "../../../components/message/RenderAudioMessage";
import { RenderFileMessage } from "../../../components/message/RenderFileMessage";
import { RenderTextWithImageMessage } from "../../../components/message/RenderTextWithImageMessage";

const errorImage =
  "https://res.cloudinary.com/dyd5381vx/image/upload/v1744732824/z6509003496600_0f4526fe7c8ca476fea6dddff2b3bc91_d4nysj.jpg";

const convertToEnglish = (char) => {
  const vietnameseMap = {
    Ă: "A",
    Â: "A",
    Á: "A",
    À: "A",
    Ả: "A",
    Ã: "A",
    Ạ: "A",
    Đ: "D",
    Ê: "E",
    É: "E",
    È: "E",
    Ẻ: "E",
    Ẽ: "E",
    Ẹ: "E",
    Í: "I",
    Ì: "I",
    Ỉ: "I",
    Ĩ: "I",
    Ị: "I",
    Ô: "O",
    Ơ: "O",
    Ó: "O",
    Ò: "O",
    Ỏ: "O",
    Õ: "O",
    Ọ: "O",
    Ú: "U",
    Ù: "U",
    Ủ: "U",
    Ũ: "U",
    Ụ: "U",
    Ư: "U",
    Ý: "Y",
    Ỳ: "Y",
    Ỷ: "Y",
    Ỹ: "Y",
    Ỵ: "Y",
  };
  return vietnameseMap[char] || char;
};

const getColorForInitial = (initial) => {
  const char = convertToEnglish(initial).toUpperCase();
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 69) return "#2e5389";
  if (code >= 70 && code <= 74) return "#2b7155";
  if (code >= 75 && code <= 79) return "#009688";
  if (code >= 80 && code <= 84) return "#3D2F00";
  if (code >= 85 && code <= 90) return "#AD8500";
  return "#B0B0B0";
};

const audioExtensions = [
  "webm",
  "mp3",
  "m4a",
  "wav",
  "ogg",
  "aac",
  "flac",
  "opus",
];

const MessageItem = ({
  message,
  isSender,
  searchQuery,
  isHighlighted,
  receiver,
  isFirstMessageFromSender,
  onScrollToMessage,
  onLongPress, // Thêm prop này để nhận sự kiện nhấn giữ
}) => {
  const navigateToProfile = useNavigateToProfile();
  const { userInfo } = useContext(AuthContext);
  const navigation = useNavigation();
  const isGroup = !receiver;
  const [senders, setSenders] = useState([]);
  const [audioPlayback, setAudioPlayback] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const spinAnim = useState(new Animated.Value(0))[0];
  const formattedTime = moment(message.createdAt).format("HH:mm");

  useEffect(() => {
    const loadSender = async () => {
      try {
        const user = await fetchUserInfo(message.senderId);
        if (user) {
          setSenders((prev) => [...prev, user]);
        }
      } catch (err) {
        console.error("Error loading sender info:", err);
      }
    };

    if (message.senderId) {
      loadSender();
    }
  }, [message.senderId]);

  const getSenderInfo = () =>
    senders.find((s) => s.userId === message.senderId);

  const renderNotification = () => {
    const { notification } = message;
    if (!notification) return null;
    return (
      <View style={MessageItemStyle.notificationContainer}>
        <Text style={MessageItemStyle.notificationText}>{message.content}</Text>
      </View>
    );
  };

  const handleDownload = async (fileUrl, fileName, downloadUrl) => {
    try {
      console.log("Downloading file:", fileUrl, fileName, downloadUrl);
      const path = FileSystem.cacheDirectory + fileName;
      const res = FileSystem.createDownloadResumable(
        downloadUrl || fileUrl,
        path
      );
      const { uri } = await res.downloadAsync();

      if (!uri) throw new Error("Không thể tải file");

      const extension = fileName.split(".").pop()?.toLowerCase();

      if (["jpg", "jpeg", "png", "mp4", "mp3"].includes(extension)) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          return Alert.alert("Từ chối truy cập", "Không thể lưu file media.");
        }

        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync("Download", asset, false);

        Alert.alert("Thành công", "File media đã lưu vào thư viện.");
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert("Đã tải", `File đã lưu vào: ${uri}`);
        }
      }
    } catch (err) {
      console.error("Download error:", err);
      Alert.alert("Lỗi", "Tải file thất bại.");
    }
  };

  const renderAvatar = () => {
    const user = getSenderInfo();
    const fullName = user?.fullname || receiver?.fullname || "User";
    const url = user?.urlavatar || receiver?.urlavatar;

    const handleAvatarClick = async () => {
      try {
        if (!user || !user.userId) {
          Alert.alert("Lỗi", "Không thể mở trang cá nhân.");
          return;
        }
        navigateToProfile(navigation, user, {
          showLoading: true,
          onLoadingChange: () => {},
        });
      } catch (error) {
        console.error("Error navigating to profile:", error);
        Alert.alert("Lỗi", "Không thể mở trang cá nhân.");
      }
    };

    return (
      <TouchableOpacity onPress={handleAvatarClick}>
        {url ? (
          <Image source={{ uri: url }} style={MessageItemStyle.avatar} />
        ) : (
          <AvatarUser
            fullName={fullName}
            width={32}
            height={32}
            avtText={12}
            shadow={false}
            bordered={false}
            style={{ marginLeft: 5 }}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderSenderName = () => {
    if (isGroup && !isSender) {
      const user = getSenderInfo();
      const name = user?.fullname || "User";
      const color = getColorForInitial(name.charAt(0));
      return (
        <Text style={[MessageItemStyle.senderName, { color }]}>{name}</Text>
      );
    }
    return null;
  };

  const renderReplyContent = () => {
    const { replyData, messageReplyId } = message;

    if (!replyData) return null;

    const replyType = replyData.type;
    const replyContent = replyData.content || "Tin nhắn không hỗ trợ";
    // Sửa lại lấy đúng tên người gửi của tin nhắn được trả lời
    let replySender = "";
    if (replyData.senderId === userInfo.userId) {
      replySender = userInfo?.fullname;
    } else if (receiver && replyData.senderId === receiver.userId) {
      replySender = receiver?.fullname;
    } else if (replyData.fullname) {
      replySender = replyData.fullname;
    } else if (replyData.senderName) {
      replySender = replyData.senderName;
    } else {
      replySender = replyData.senderId || "Người gửi";
    }

    if (replyData.isRecall || messageReplyId?.isRecall) {
      return (
        <TouchableOpacity onPress={() => onScrollToMessage(messageReplyId)}>
          <View style={MessageItemStyle.replyContainer}>
            <Text style={MessageItemStyle.replySender}>{replySender}:</Text>
            <Text style={MessageItemStyle.replyContent}>
              Tin nhắn đã được thu hồi
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    // Hiển thị dạng đẹp cho các loại tin nhắn trả lời
    return (
      <TouchableOpacity onPress={() => onScrollToMessage(messageReplyId)}>
        <View
          style={[
            MessageItemStyle.replyContainer,
            { flexDirection: "row", alignItems: "center", minHeight: 44 },
          ]}
        >
          {/* Icon hoặc hình ảnh bên trái */}
          {(() => {
            const attachment = replyData.attachment;
            if (replyType === "image" || replyType === "text-with-image") {
              return (
                <Image
                  source={{
                    uri: (attachment && attachment.url) || attachment || "",
                  }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 6,
                    marginRight: 8,
                    backgroundColor: "#eee",
                  }}
                />
              );
            }
            if (replyType === "audio") {
              return (
                <AntDesign
                  name="sound"
                  size={28}
                  color={Color.sophy}
                  style={{ marginRight: 8 }}
                />
              );
            }
            if (replyType === "file") {
              return (
                <AntDesign
                  name="file1"
                  size={28}
                  color={Color.sophy}
                  style={{ marginRight: 8 }}
                />
              );
            }
            if (replyType === "video") {
              return (
                <AntDesign
                  name="videocamera"
                  size={28}
                  color={Color.sophy}
                  style={{ marginRight: 8 }}
                />
              );
            }
            return null;
          })()}
          {/* Nội dung trả lời */}
          <View style={{ flex: 1 }}>
            <Text style={MessageItemStyle.replySender}>{replySender}:</Text>
            <Text
              style={MessageItemStyle.replyContent}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {replyType === "text" || replyType === "text-with-image"
                ? replyContent
                : replyType === "image"
                ? "[Hình ảnh]"
                : replyType === "audio"
                ? replyData.attachment?.name || "[Ghi âm]"
                : replyType === "file"
                ? replyData.attachment?.name || "[Tệp tin]"
                : replyType === "video"
                ? "[Video]"
                : replyContent}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const isLink = (text) => {
    const urlRegex =
      /\b(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.(com|net|org|io|gov|edu|vn|co))\b/gi;
    return urlRegex.test(text);
  };

  const handleLinkPress = async (url) => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Không thể mở link", url);
    }
  };

  const renderTextWithLinks = (text) => {
    const urlRegex =
      /\b(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.(com|net|org|io|gov|edu|vn|co))\b/gi;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (isLink(part)) {
        return (
          <TouchableOpacity key={index} onPress={() => handleLinkPress(part)}>
            <Text
              style={[
                MessageItemStyle.content,
                { color: "#3f88f2", padding: 0, margin: 0 },
              ]}
            >
              {part}
            </Text>
          </TouchableOpacity>
        );
      }
      return (
        <Text key={index} style={MessageItemStyle.content}>
          {part}
        </Text>
      );
    });
  };

  const isAudioFile = (fileName = "") => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    return audioExtensions.includes(ext);
  };

  const formatTime = (millis) => {
    const totalSeconds = Math.floor((millis || 0) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handlePlayPauseAudio = async (audioUrl) => {
    try {
      if (audioPlayback && isAudioPlaying) {
        await audioPlayback.pauseAsync();
        setIsAudioPlaying(false);
        setIsAudioPaused(true);
        return;
      }
      if (audioPlayback && isAudioPaused) {
        await audioPlayback.playAsync();
        setIsAudioPlaying(true);
        setIsAudioPaused(false);
        return;
      }
      if (audioPlayback) {
        await audioPlayback.unloadAsync();
        setAudioPlayback(null);
        setIsAudioPlaying(false);
        setIsAudioPaused(false);
        setAudioPosition(0);
        setAudioDuration(0);
      }
      setIsAudioLoading(true);
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      setAudioPlayback(sound);
      const status = await sound.getStatusAsync();
      setAudioDuration(status.durationMillis || 0);
      setIsAudioPlaying(true);
      setIsAudioPaused(false);
      setIsAudioLoading(false);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setAudioPosition(status.positionMillis || 0);
          setAudioDuration(status.durationMillis || 0);
          if (status.didJustFinish) {
            setIsAudioPlaying(false);
            setIsAudioPaused(false);
            sound.unloadAsync();
            setAudioPlayback(null);
            setAudioPosition(0);
          }
        }
      });
    } catch (err) {
      setIsAudioPlaying(false);
      setIsAudioPaused(false);
      setIsAudioLoading(false);
      Alert.alert("Lỗi", "Không thể phát file âm thanh.");
    }
  };

  useEffect(() => {
    return () => {
      if (audioPlayback) {
        audioPlayback.unloadAsync();
      }
    };
  }, [audioPlayback]);

  useEffect(() => {
    let animation;
    if (isAudioLoading) {
      animation = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
    } else {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [isAudioPlaying, isAudioLoading, spinAnim]);

  const renderAudioPlayer = (
    audioUrl,
    isLoading,
    isPlaying,
    isPaused,
    onPress,
    position,
    duration
  ) => (
    <View style={MessageItemStyle.fileContainer}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <TouchableOpacity
          onPress={onPress}
          style={{
            backgroundColor: "#e0e0e0",
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
          disabled={isLoading}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate:
                    isPlaying || isLoading
                      ? spinAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
                        })
                      : "0deg",
                },
              ],
            }}
          >
            {isLoading ? (
              <AntDesign name="loading1" size={24} color={Color.sophy} />
            ) : isPlaying ? (
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

  const renderContent = () => {
    const { type, attachment, isRecall, isReply } = message;
    const content = message.content || "";

    if (type === "notification") {
      return renderNotification();
    }

    if (isRecall) {
      return (
        <Text style={MessageItemStyle.recalledMessage}>
          Tin nhắn đã được thu hồi
        </Text>
      );
    }

    // Audio
    if (
      (type === "audio" && attachment && attachment.url) ||
      (type === "audio" && message.attachment && message.attachment.url) ||
      (type === "file" && attachment && isAudioFile(attachment.name))
    ) {
      const audioUrl =
        (attachment && attachment.url) ||
        (message.attachment && message.attachment.url);

      return RenderAudioMessage({
        audioUrl,
        isAudioLoading,
        isAudioPlaying,
        isAudioPaused,
        onPress: () => handlePlayPauseAudio(audioUrl),
        position: audioPosition,
        duration: audioDuration,
        spinAnim,
      });
    }

    // Text with image
    if (
      (type === "text-with-image" && attachment && attachment.url) ||
      (type === "text-with-image" &&
        message.attachment &&
        message.attachment.url)
    ) {
      const imageUrl =
        (attachment && attachment.url) ||
        (message.attachment && message.attachment.url) ||
        errorImage;
      return RenderTextWithImageMessage({
        content,
        imageUrl,
        navigation,
        MessageItemStyle,
      });
    }

    // Image
    if (type === "image" && attachment) {
      return RenderImageMessage({
        attachment,
        isSender,
        navigation,
        errorImage,
        MessageItemStyle,
        onLongPress,
      });
    }

    // Video
    if (type === "video" && attachment) {
      return (
        <View
          style={[
            MessageItemStyle.mediaOuter,
            isSender
              ? MessageItemStyle.mediaSender
              : MessageItemStyle.mediaReceiver,
            MessageItemStyle.mediaBorder, // Thêm viền xanh
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

    // File
    if (type === "file" && attachment) {
      return RenderFileMessage({
        attachment,
        handleDownload,
        MessageItemStyle,
      });
    }

    // Text
    return (
      <>
        {isReply && renderReplyContent()}
        {type === "text" ? (
          <View>
            {searchQuery ? (
              <HighlightText
                text={content}
                searchQuery={searchQuery}
                style={MessageItemStyle.content}
                highlightStyle={{ backgroundColor: "#FFFF00" }}
              />
            ) : (
              renderTextWithLinks(content)
            )}
          </View>
        ) : (
          <Text style={MessageItemStyle.unsupported}>
            Không hỗ trợ loại tin nhắn này
          </Text>
        )}
      </>
    );
  };

  const renderStatus = () => {
    if (!isSender || !isFirstMessageFromSender) return null;

    let text = "Đã gửi";
    if (receiver && message.readBy?.some((u) => u.userId === receiver.userId)) {
      text = "Đã xem";
    } else if (message.sendStatus === "sending") {
      text = "Đang gửi...";
    } else if (message.sendStatus === "seen") {
      text = "Đã xem";
    }

    return <Text style={MessageItemStyle.statusText}>{text}</Text>;
  };

  if (message.type === "notification") {
    return (
      <View style={MessageItemStyle.notificationContainer}>
        {renderNotification()}
      </View>
    );
  }

  return (
    <View
      style={[
        MessageItemStyle.container,
        isSender
          ? MessageItemStyle.senderContainer
          : MessageItemStyle.receiverContainer,
        isHighlighted && MessageItemStyle.highlighted,
      ]}
    >
      {!isSender && (
        <View style={MessageItemStyle.avatarContainer}>{renderAvatar()}</View>
      )}
      <View>
        {/* Nếu là hình/video thì renderContent đã nằm ngoài messageBox, thời gian nằm ngoài. 
            Nếu là text thì thời gian nằm trong messageBox và không có nền */}
        {message.type === "image" || message.type === "video" ? (
          <>
            {renderContent()}
            <Text style={MessageItemStyle.timestamp}>{formattedTime}</Text>
            <View style={MessageItemStyle.newText}>{renderStatus()}</View>
          </>
        ) : (
          <>
            <View
              style={[
                MessageItemStyle.messageBox,
                isSender ? MessageItemStyle.sender : MessageItemStyle.receiver,
              ]}
            >
              {renderSenderName()}
              {renderContent()}
              {/* Thời gian nằm trong messageBox cho text, KHÔNG nền */}
              <Text style={MessageItemStyle.timestampText}>
                {formattedTime}
              </Text>
            </View>
            <View style={MessageItemStyle.newText}>{renderStatus()}</View>
          </>
        )}
      </View>
    </View>
  );
};

export default MessageItem;
