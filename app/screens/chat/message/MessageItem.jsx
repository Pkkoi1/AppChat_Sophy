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
  Clipboard,
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
  onLongPress,
  onCopy, // thêm prop này để nhận sự kiện copy
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
  const [audioLocalUri, setAudioLocalUri] = useState(null);
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

  const renderFileIcon = (type) => {
    if (type.includes("pdf"))
      return <FontAwesome5 name="file-pdf" size={24} color="#d9534f" />;
    if (type.includes("word"))
      return <FontAwesome5 name="file-word" size={24} color="#007bff" />;
    if (type.includes("excel"))
      return <FontAwesome5 name="file-excel" size={24} color="#28a745" />;
    if (type.includes("zip"))
      return <FontAwesome5 name="file-archive" size={24} color="#f0ad4e" />;
    return <MaterialIcons name="insert-drive-file" size={24} color="#6c757d" />;
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
    const replySender =
      replyData.senderId === userInfo.userId
        ? userInfo?.fullname
        : receiver?.fullname;

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

    return (
      <TouchableOpacity onPress={() => onScrollToMessage(messageReplyId)}>
        <View style={MessageItemStyle.replyContainer}>
          <Text style={MessageItemStyle.replySender}>{replySender}:</Text>
          {replyType === "text" ? (
            <Text style={MessageItemStyle.replyContent}>{replyContent}</Text>
          ) : replyType === "image" || "text-with-image" ? (
            <Text style={MessageItemStyle.replyContent}>[Hình ảnh]</Text>
          ) : replyType === "file" ? (
            <Text style={MessageItemStyle.replyContent}>[Tệp tin]</Text>
          ) : replyType === "video" ? (
            <Text style={MessageItemStyle.replyContent}>[Video]</Text>
          ) : replyType === "audio" ? (
            <Text style={MessageItemStyle.replyContent}>[Ghi âm]</Text>
          ) : (
            <Text style={MessageItemStyle.replyContent}>[Không hỗ trợ]</Text>
          )}
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
            <Text style={[MessageItemStyle.content, { color: "#3f88f2" }]}>
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

  // Khi message/attachment thay đổi, nếu là link mạng thì tải về local cache
  useEffect(() => {
    let isMounted = true;
    const prepareAudio = async () => {
      const audioUrl =
        (message.attachment && message.attachment.url) ||
        (message.attachment && message.attachment.downloadUrl) ||
        (message.attachment && message.attachment.uri);
      if (!audioUrl) return;
      if (audioUrl.startsWith("file://")) {
        setAudioLocalUri(audioUrl);
        return;
      }
      try {
        const fileName = audioUrl.split("/").pop().split("?")[0];
        const localPath = FileSystem.cacheDirectory + fileName;
        const fileInfo = await FileSystem.getInfoAsync(localPath);
        if (fileInfo.exists) {
          setAudioLocalUri(localPath);
        } else {
          const downloadResumable = FileSystem.createDownloadResumable(
            audioUrl,
            localPath
          );
          const { uri } = await downloadResumable.downloadAsync();
          if (isMounted) setAudioLocalUri(uri);
        }
      } catch (err) {
        setAudioLocalUri(null);
      }
    };
    if (
      message.type === "audio" ||
      (message.type === "file" && isAudioFile(message.attachment?.name))
    ) {
      prepareAudio();
    }
    return () => {
      isMounted = false;
    };
  }, [message]);

  const handlePlayPauseAudio = async (audioUrl) => {
    try {
      const playUrl = audioLocalUri || audioUrl;
      if (!playUrl) return;
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
      const { sound } = await Audio.Sound.createAsync({ uri: playUrl });
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

    // Nếu là tin nhắn audio (type === "audio" hoặc attachment.type === "audio" hoặc file đuôi audio)
    if (
      (type === "audio" && attachment && attachment.url) ||
      (type === "audio" && message.attachment && message.attachment.url) ||
      (type === "file" && attachment && isAudioFile(attachment.name))
    ) {
      const audioUrl =
        (attachment && attachment.url) ||
        (message.attachment && message.attachment.url);
      return renderAudioPlayer(
        audioLocalUri || audioUrl,
        isAudioLoading,
        isAudioPlaying,
        isAudioPaused,
        () => handlePlayPauseAudio(audioUrl),
        audioPosition,
        audioDuration
      );
    }

    // Hiển thị text-with-image: nội dung phía trên hình ảnh
    if (
      (type === "text-with-image" && attachment && attachment.url) ||
      (type === "text-with-image" && message.attachment && message.attachment.url)
    ) {
      const imageUrl =
        (attachment && attachment.url) ||
        (message.attachment && message.attachment.url) ||
        errorImage;
      return (
        <View>
          {content ? (
            <View style={MessageItemStyle.textContainer}>
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
            <Image
              source={{ uri: imageUrl }}
              style={MessageItemStyle.image}
            />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        {isReply && renderReplyContent()}
        {type === "text" ? (
          <View style={MessageItemStyle.textContainer}>
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
        ) : type === "file" && attachment ? (
          // Nếu là file không phải audio
          <View style={MessageItemStyle.fileContainer}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              {renderFileIcon(attachment.type || "unknown")}
              <Text style={MessageItemStyle.fileName}>
                {attachment.name || "Tệp tin"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                handleDownload(
                  attachment.url,
                  attachment.name || "Tệp tin",
                  attachment.downloadUrl
                )
              }
              style={MessageItemStyle.downloadButton}
            >
              <Text style={MessageItemStyle.downloadButtonText}>Tải xuống</Text>
            </TouchableOpacity>
          </View>
        ) : type === "image" && attachment ? (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("FullScreenImageViewer", {
                imageUrl: attachment.url || errorImage,
              })
            }
          >
            <Image
              source={{ uri: attachment.url || errorImage }}
              style={MessageItemStyle.image}
            />
          </TouchableOpacity>
        ) : type === "video" && attachment ? (
          <View>
            <Video
              source={{ uri: attachment.url }}
              style={MessageItemStyle.video}
              resizeMode="contain"
              useNativeControls
            />
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

  // Hàm xử lý copy tin nhắn
  const handleCopy = () => {
    if (message.isRecall) return;
    let contentToCopy = "";
    if (message.type === "text" || message.type === "notification") {
      contentToCopy = message.content;
    } else if (
      message.type === "image" ||
      message.type === "video" ||
      message.type === "file"
    ) {
      contentToCopy = message.attachment?.url || message.attachment?.name || "";
    }
    if (contentToCopy) {
      if (onCopy) {
        onCopy(contentToCopy, message);
      } else {
        Clipboard.setString(contentToCopy);
        Alert.alert("Thành công", "Đã sao chép tin nhắn!");
      }
    }
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
        <View
          style={[
            MessageItemStyle.messageBox,
            isSender ? MessageItemStyle.sender : MessageItemStyle.receiver,
          ]}
        >
          {renderSenderName()}
          {renderContent()}
          <Text style={MessageItemStyle.timestamp}>{formattedTime}</Text>
        </View>
        <View style={MessageItemStyle.newText}>{renderStatus()}</View>
      </View>
    </View>
  );
};

export default MessageItem;
