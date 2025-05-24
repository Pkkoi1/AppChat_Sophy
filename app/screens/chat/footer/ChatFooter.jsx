import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Text,
  Platform,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import * as DocumentPicker from "expo-document-picker";
import AntDesign from "@expo/vector-icons/AntDesign";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import Color from "@/app/components/colors/Color";
import { AuthContext } from "@/app/auth/AuthContext";
import * as FileSystem from "expo-file-system";
import { CLOUDINARY_PRESET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_URL } from "@env";
import { Dialog } from "@rneui/themed";
import { api } from "@/app/api/api";

const ChatFooter = ({
  onSendMessage,
  onSendImage,
  onSendFile,
  onSendVideo,
  onSendAudio,
  socket,
  conversation,
  setIsTyping,
  replyingTo,
  setReplyingTo,
  receiver, // thêm receiver vào props
}) => {
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const typingTimeoutRef = useRef(null);
  const userTypingTimeoutRef = useRef(null);
  const recordTimerRef = useRef(null);
  const { userInfo } = useContext(AuthContext);
  const [otherSenderName, setOtherSenderName] = useState("");

  // Lấy tên người gửi khi trả lời mà không phải userInfo
  useEffect(() => {
    const fetchOtherSender = async () => {
      if (
        replyingTo &&
        replyingTo.senderId &&
        userInfo?.userId &&
        replyingTo.senderId !== userInfo.userId
      ) {
        try {
          const res = await api.getUserById(replyingTo.senderId);
          setOtherSenderName(res?.data?.fullname || replyingTo.senderId);
        } catch {
          setOtherSenderName(replyingTo.senderId);
        }
      } else {
        setOtherSenderName("");
      }
    };
    fetchOtherSender();
  }, [replyingTo, userInfo?.userId]);

  useEffect(() => {
    if (socket && conversation?.conversationId) {
      socket.on("userTyping", ({ conversationId, userId, fullname }) => {
        if (
          userId &&
          userId !== userInfo.userId &&
          userId !== undefined &&
          userId !== "undefined"
        ) {
          setIsTyping(true);
        }

        if (userTypingTimeoutRef.current) {
          clearTimeout(userTypingTimeoutRef.current);
        }
        userTypingTimeoutRef.current = setTimeout(() => {
          setIsTyping(null);
        }, 1000);
      });

      return () => {
        socket.off("userTyping");
        if (userTypingTimeoutRef.current) {
          clearTimeout(userTypingTimeoutRef.current);
        }
      };
    }
  }, [socket, conversation, setIsTyping, userInfo.userId]);

  const handleTyping = () => {
    if (socket) {
      socket.emit("typing", {
        conversationId: conversation.conversationId,
        userId: socket.userId,
        fullname: userInfo.fullname,
      });
      console.log("Người dùng đang nhập...");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleInputChange = (text) => {
    setMessage(text);
    handleTyping();
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage({ type: "text", content: message });
      setMessage("");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setIsTyping(false);
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Ghi âm modal
  const openRecordModal = () => {
    setShowRecordModal(true);
    setRecording(null);
    setIsRecording(false);
    setRecordSeconds(0);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
  };

  const closeRecordModal = () => {
    if (isRecording) {
      Alert.alert("Xác nhận", "Bạn có chắc muốn thoát và hủy ghi âm?", [
        { text: "Không", style: "cancel" },
        {
          text: "Có",
          style: "destructive",
          onPress: () => {
            setShowRecordModal(false);
            setIsRecording(false);
            setRecording(null);
            setRecordSeconds(0);
            if (recordTimerRef.current) clearInterval(recordTimerRef.current);
          },
        },
      ]);
    } else {
      setShowRecordModal(false);
      setIsRecording(false);
      setRecording(null);
      setRecordSeconds(0);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Quyền truy cập bị từ chối",
          "Ứng dụng cần quyền truy cập microphone."
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
      setRecordSeconds(0);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (error) {
      console.error("Lỗi khi bắt đầu ghi âm:", error);
      Alert.alert("Lỗi", "Không thể bắt đầu ghi âm. Vui lòng thử lại.");
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        setIsRecording(false);
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      }
    } catch (error) {
      console.error("Lỗi khi dừng ghi âm:", error);
      Alert.alert("Lỗi", "Không thể lưu ghi âm. Vui lòng thử lại.");
    }
  };

  const sendRecording = async () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn gửi ghi âm này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Gửi",
        style: "default",
        onPress: async () => {
          try {
            if (recording) {
              const uri = recording.getURI();
              setRecording(null);
              setIsRecording(false);
              setShowRecordModal(false);
              setRecordSeconds(0);
              if (recordTimerRef.current) clearInterval(recordTimerRef.current);

              const fileName = `recording_${Date.now()}.m4a`;
              const attachment = await uploadAudioToCloudinary({
                uri,
                name: fileName,
              });
              onSendAudio?.({
                attachment: {
                  url: attachment.url,
                  downloadUrl: attachment.downloadUrl,
                  name: fileName,
                  size: attachment.size,
                  type: "audio",
                },
              });
            }
          } catch (error) {
            Alert.alert("Lỗi", "Không thể gửi ghi âm. Vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  const formatRecordTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const pickDocument = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Quyền truy cập bị từ chối",
          "Ứng dụng cần quyền truy cập thư viện tệp."
        );
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const selectedFile = result.assets[0];
        console.log("Đã chọn file:", selectedFile);

        const mime = selectedFile.mimeType || "";
        const fileName = selectedFile.name || "";
        const fileExtension = fileName.split(".").pop()?.toLowerCase();

        if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
          onSendImage?.({
            type: "image",
            attachment: selectedFile.uri,
            fileName: fileName,
          });
        } else if (mime.startsWith("video")) {
          try {
            const attachment = await uploadVideoToCloudinary(selectedFile);
            onSendVideo?.({ ...attachment });
          } catch (error) {
            Alert.alert("Lỗi", "Không thể tải video lên. Vui lòng thử lại.");
          }
        } else {
          if (selectedFile.size > 10485760) {
            Alert.alert(
              "Kích thước tệp quá lớn",
              "Vui lòng chọn tệp nhỏ hơn 10MB."
            );
            return;
          }
          onSendFile?.({
            type: "file",
            attachment: selectedFile.uri,
            fileName: fileName,
            mimeType: mime,
          });
        }
      } else {
        console.log("Người dùng hủy hoặc không có file.");
      }
    } catch (error) {
      console.error("Lỗi chọn file:", error);
    }
  };

  const uploadFileToCloudinary = async (selectedFile) => {
    try {
      const base64File = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileBase64 = `data:${selectedFile.mimeType};base64,${base64File}`;
      const data = new FormData();
      data.append("file", fileBase64);
      data.append("upload_preset", CLOUDINARY_PRESET);
      data.append("cloud_name", CLOUDINARY_CLOUD_NAME);

      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Lỗi khi upload file lên Cloudinary:", result);
        throw new Error(result.error?.message || "Upload file thất bại.");
      }

      console.log("Đã upload file lên Cloudinary:", result);
      const attachment = {
        type: "file",
        url: result.secure_url,
        downloadUrl: result.secure_url.replace(
          "/upload/",
          "/upload/fl_attachment/"
        ),
        size: result.bytes,
        name: selectedFile.name,
      };
      return attachment;
    } catch (error) {
      console.error("Lỗi khi upload file lên Cloudinary:", error);
      throw error;
    }
  };

  const uploadVideoToCloudinary = async (selectedMedia) => {
    try {
      const base64File = await FileSystem.readAsStringAsync(selectedMedia.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileBase64 = `data:${
        selectedMedia.type || "video/mp4"
      };base64,${base64File}`;
      const data = new FormData();
      data.append("file", fileBase64);
      data.append("upload_preset", CLOUDINARY_PRESET);
      data.append("cloud_name", CLOUDINARY_CLOUD_NAME);

      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Lỗi khi upload video lên Cloudinary:", result);
        throw new Error(result.error?.message || "Upload video thất bại.");
      }

      console.log("Đã upload video lên Cloudinary:", result);
      const attachment = {
        type: "video",
        url: result.secure_url,
        downloadUrl: result.secure_url.replace(
          "/upload/",
          "/upload/fl_attachment/"
        ),
        size: result.bytes,
        name: selectedMedia.name,
      };
      return attachment;
    } catch (error) {
      console.error("Lỗi khi upload video lên Cloudinary:", error);
      throw error;
    }
  };

  const uploadAudioToCloudinary = async (selectedMedia) => {
    try {
      const base64File = await FileSystem.readAsStringAsync(selectedMedia.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileBase64 = `data:audio/m4a;base64,${base64File}`;
      const data = new FormData();
      data.append("file", fileBase64);
      data.append("upload_preset", CLOUDINARY_PRESET);
      data.append("cloud_name", CLOUDINARY_CLOUD_NAME);

      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Lỗi khi upload audio lên Cloudinary:", result);
        throw new Error(result.error?.message || "Upload audio thất bại.");
      }

      console.log("Đã upload audio lên Cloudinary:", result);
      const attachment = {
        type: "audio",
        url: result.secure_url,
        downloadUrl: result.secure_url.replace(
          "/upload/",
          "/upload/fl_attachment/"
        ),
        size: result.bytes,
        name: selectedMedia.name,
      };
      return attachment;
    } catch (error) {
      console.error("Lỗi khi upload audio lên Cloudinary:", error);
      throw error;
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Quyền truy cập bị từ chối",
          "Ứng dụng cần quyền truy cập thư viện phương tiện."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.5,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const selectedMedia = result.assets[0];
        const fileExtension = selectedMedia.uri.split(".").pop()?.toLowerCase();

        if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
          onSendImage({ type: "image", attachment: selectedMedia.uri });
        } else if (selectedMedia.type === "video") {
          try {
            const attachment = await uploadVideoToCloudinary(selectedMedia);
            onSendVideo({ ...attachment });
          } catch (error) {
            Alert.alert("Lỗi", "Không thể tải video lên. Vui lòng thử lại.");
          }
        }
      } else {
        console.log("Người dùng hủy hoặc không chọn gì.");
      }
    } catch (error) {
      console.error("Lỗi chọn phương tiện:", error);
    }
  };

  return (
    <View style={ChatFooterStyle.container}>
      {/* Modal ghi âm */}
      <Dialog
        isVisible={showRecordModal}
        onBackdropPress={closeRecordModal}
        onRequestClose={closeRecordModal}
        backdropStyle={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        overlayStyle={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 24,
          width: 320,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{ position: "absolute", left: 12, top: 12 }}
          onPress={closeRecordModal}
        >
          <AntDesign name="arrowleft" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
          Ghi âm tin nhắn
        </Text>
        <Text style={{ fontSize: 32, marginBottom: 24 }}>
          {formatRecordTime(recordSeconds)}
        </Text>
        {!isRecording && !recording && (
          <TouchableOpacity
            onPress={startRecording}
            style={{
              backgroundColor: Color.sophy,
              borderRadius: 24,
              paddingHorizontal: 32,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Feather
              name="mic"
              size={24}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              Bắt đầu ghi
            </Text>
          </TouchableOpacity>
        )}
        {isRecording && (
          <TouchableOpacity
            onPress={stopRecording}
            style={{
              backgroundColor: "#ff5252",
              borderRadius: 24,
              paddingHorizontal: 32,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Feather
              name="stop-circle"
              size={24}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              Dừng ghi
            </Text>
          </TouchableOpacity>
        )}
        {!isRecording && recording && (
          <TouchableOpacity
            onPress={sendRecording}
            style={{
              backgroundColor: Color.sophy,
              borderRadius: 24,
              paddingHorizontal: 32,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <Feather
              name="send"
              size={24}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              Gửi ghi âm
            </Text>
          </TouchableOpacity>
        )}
      </Dialog>
      {replyingTo &&
        (console.log("Đang trả lời tin nhắn:", receiver),
        (
          <View style={[ChatFooterStyle.replyContainer, { minHeight: 70 }]}>
            <View
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
              {/* Icon hoặc hình ảnh bên trái */}
              {(() => {
                const type =
                  replyingTo.type ||
                  (replyingTo.attachment && replyingTo.attachment.type);
                const attachment = replyingTo.attachment;
                if (type === "image" || type === "text-with-image") {
                  return (
                    <Image
                      source={{
                        uri: (attachment && attachment.url) || attachment || "",
                      }}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 6,
                        marginRight: 10,
                        backgroundColor: "#eee",
                      }}
                    />
                  );
                }
                if (type === "audio") {
                  return (
                    <Feather
                      name="mic"
                      size={28}
                      color={Color.sophy}
                      style={{ marginRight: 10 }}
                    />
                  );
                }
                if (type === "file") {
                  return (
                    <AntDesign
                      name="file1"
                      size={28}
                      color={Color.sophy}
                      style={{ marginRight: 10 }}
                    />
                  );
                }
                return null;
              })()}
              {/* Nội dung trả lời */}
              <View style={{ flex: 1 }}>
                {/* Tên người gửi và loại tin nhắn */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 2,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 14,
                      color: "#333",
                      flex: 1,
                    }}
                  >
                    {replyingTo.senderId === userInfo?.userId
                      ? userInfo?.fullname
                      : otherSenderName ||
                        receiver?.fullname ||
                        replyingTo.senderName ||
                        replyingTo.fullname ||
                        replyingTo.senderId ||
                        "Người gửi"}
                  </Text>
                </View>
                {/* Nội dung hoặc tên file/audio */}
                <Text
                  style={{
                    fontSize: 13,
                    color: "#444",
                    marginBottom: 2,
                    maxHeight: 36,
                    overflow: "hidden",
                  }}
                  numberOfLines={2}
                >
                  {(() => {
                    const type =
                      replyingTo.type ||
                      (replyingTo.attachment && replyingTo.attachment.type);
                    if (type === "text" || type === "text-with-image") {
                      return replyingTo.content;
                    }
                    if (type === "image") {
                      return "[Hình ảnh]";
                    }
                    if (type === "audio") {
                      return replyingTo.attachment?.name || "[Ghi âm]";
                    }
                    if (type === "file") {
                      return replyingTo.attachment?.name || "[Tệp tin]";
                    }
                    if (type === "video") {
                      return "[Video]";
                    }
                    return replyingTo.content || "";
                  })()}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleCancelReply}
              style={{ marginLeft: 8, alignSelf: "flex-start" }}
            >
              <Ionicons name="close" size={20} color="#8f8f8f" />
            </TouchableOpacity>
          </View>
        ))}
      <View style={ChatFooterStyle.inputContainer}>
        <TouchableOpacity>
          <MaterialCommunityIcons
            name="sticker-emoji"
            size={24}
            color="#8f8f8f"
          />
        </TouchableOpacity>
        <TextInput
          placeholder="Nhập tin nhắn"
          style={ChatFooterStyle.text}
          value={message}
          onChangeText={handleInputChange}
        />
        {message.trim() ? (
          <TouchableOpacity
            onPress={handleSend}
            style={ChatFooterStyle.sendButton}
          >
            <Ionicons name="send" size={24} color="#005ae0" />
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity onPress={pickDocument}>
              <AntDesign name="addfile" size={24} color="#8f8f8f" />
            </TouchableOpacity>
            <TouchableOpacity onPress={openRecordModal}>
              <Feather name="mic" size={24} color="#8f8f8f" />
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage}>
              <SimpleLineIcons name="picture" size={24} color="#8f8f8f" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const ChatFooterStyle = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  replyContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  replyContent: {
    flex: 1,
  },
  replyLabel: {
    fontSize: 12,
    color: "#666",
  },
  replyText: {
    fontSize: 14,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  sendButton: {
    paddingHorizontal: 10,
  },
});

export default React.memo(ChatFooter);
