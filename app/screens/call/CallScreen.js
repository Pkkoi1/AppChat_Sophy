import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { AuthContext } from "@/app/auth/AuthContext";
import { SocketContext } from "@/app/socket/SocketContext";
import AvatarUser from "@/app/components/profile/AvatarUser";
import { Ionicons } from "@expo/vector-icons";
import Color from "@/app/components/colors/Color";

const CallScreen = ({ navigation, route }) => {
  const { userInfo } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const {
    callType,
    isVideo,
    receiver,
    conversationId,
    calleeId,
    incoming = false,
  } = route.params || {};
  const [callStatus, setCallStatus] = useState(
    incoming ? "incoming" : "connecting"
  );
  const [callDuration, setCallDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  // Generate a unique call ID
  const callId = `call_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  // Format call duration as MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (callStatus === "connected") {
      // Start call timer
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    }
  }, [callStatus]);

  useEffect(() => {
    // Emit call invitation through socket for outgoing calls
    if (!incoming && socket) {
      socket.emit("callInvitation", {
        callerId: userInfo.userId,
        callerName: userInfo.fullname,
        calleeId: calleeId,
        conversationId: conversationId,
        callId: callId,
        isVideo: isVideo,
        timestamp: new Date().toISOString(),
      });

      console.log("Emitted call invitation", {
        callerId: userInfo.userId,
        calleeId: calleeId,
        isVideo: isVideo,
      });

      // Set a timeout for unanswered calls
      const timer = setTimeout(() => {
        Alert.alert("Không có phản hồi", "Người nhận không trả lời cuộc gọi.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }, 30000); // 30 seconds timeout

      return () => clearTimeout(timer);
    }

    // Listen for call events
    if (socket) {
      socket.on("callAccepted", (data) => {
        console.log("Call accepted:", data);
        if (
          data.callId === callId ||
          (incoming && data.callerId === userInfo.userId)
        ) {
          setCallStatus("connected");
          // Here you would initialize ZegoCloud call
        }
      });

      socket.on("callRejected", (data) => {
        console.log("Call rejected:", data);
        if (
          data.callId === callId ||
          (incoming && data.callerId === userInfo.userId)
        ) {
          Alert.alert("Thông báo", "Cuộc gọi đã bị từ chối");
          navigation.goBack();
        }
      });

      socket.on("callEnded", (data) => {
        console.log("Call ended:", data);
        if (
          data.callId === callId ||
          data.calleeId === userInfo.userId ||
          data.userId === calleeId
        ) {
          Alert.alert("Thông báo", "Cuộc gọi đã kết thúc");
          navigation.goBack();
        }
      });

      return () => {
        socket.off("callAccepted");
        socket.off("callRejected");
        socket.off("callEnded");
      };
    }
  }, []);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const handleEndCall = () => {
    if (socket) {
      socket.emit("callEnded", {
        callId: callId,
        userId: userInfo.userId,
        calleeId: calleeId,
      });
    }

    if (timerInterval) {
      clearInterval(timerInterval);
    }

    navigation.goBack();
  };

  const handleAcceptCall = () => {
    if (socket) {
      socket.emit("callAccepted", {
        callId: callId,
        userId: userInfo.userId,
        callerId: calleeId,
      });
      setCallStatus("connected");
      // Here you would initialize ZegoCloud call
    }
  };

  const handleRejectCall = () => {
    if (socket) {
      socket.emit("callRejected", {
        callId: callId,
        userId: userInfo.userId,
        callerId: calleeId,
      });
    }
    navigation.goBack();
  };

  // Trong CallScreen.js - Thêm một nút để mô phỏng chấp nhận cuộc gọi
  const simulateAnswerCall = () => {
    // Giả lập sự kiện socket "callAccepted"
    const fakeEvent = {
      callId: callId,
      userId: "fake-user-id",
      callerId: calleeId,
    };

    // Xử lý sự kiện giống như khi nhận từ socket
    setCallStatus("connected");
    console.log("Đã mô phỏng chấp nhận cuộc gọi:", fakeEvent);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      <View style={styles.callerInfo}>
        {receiver?.urlavatar ? (
          <Image source={{ uri: receiver.urlavatar }} style={styles.avatar} />
        ) : (
          <AvatarUser
            fullName={receiver?.fullname || "Unknown"}
            width={100}
            height={100}
            avtText={40}
          />
        )}
        <Text style={styles.callerName}>{receiver?.fullname || "Unknown"}</Text>
        <Text style={styles.callStatus}>
          {callStatus === "connecting"
            ? "Đang gọi..."
            : callStatus === "incoming"
            ? "Cuộc gọi đến"
            : formatDuration(callDuration)}
        </Text>
      </View>

      {callStatus === "connecting" && (
        <ActivityIndicator
          size="large"
          color={Color.sophy}
          style={styles.loader}
        />
      )}

      <View style={styles.callControls}>
        {callStatus === "connected" && (
          <>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="mic-off" size={24} color="#fff" />
              <Text style={styles.controlText}>Tắt tiếng</Text>
            </TouchableOpacity>

            {isVideo && (
              <TouchableOpacity style={styles.controlButton}>
                <Ionicons name="camera-reverse" size={24} color="#fff" />
                <Text style={styles.controlText}>Đổi cam</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="volume-high" size={24} color="#fff" />
              <Text style={styles.controlText}>Loa</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.callActions}>
        {callStatus === "incoming" ? (
          <>
            <TouchableOpacity
              style={[styles.callButton, styles.rejectButton]}
              onPress={handleRejectCall}
            >
              <Ionicons
                name="call"
                size={30}
                color="#fff"
                style={{ transform: [{ rotate: "135deg" }] }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.callButton, styles.acceptButton]}
              onPress={handleAcceptCall}
            >
              <Ionicons name="call" size={30} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.callButton, styles.rejectButton]}
            onPress={handleEndCall}
          >
            <Ionicons
              name="call"
              size={30}
              color="#fff"
              style={{ transform: [{ rotate: "135deg" }] }}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Thêm nút giả lập chấp nhận cuộc gọi cho mục đích kiểm tra */}
      {callStatus === "connecting" && (
        <TouchableOpacity
          style={styles.debugButton}
          onPress={simulateAnswerCall}
        >
          <Text style={styles.debugText}>
            DEBUG: Giả lập chấp nhận cuộc gọi
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "space-between",
  },
  callerInfo: {
    alignItems: "center",
    marginTop: 80,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  callerName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  callStatus: {
    color: "#aaa",
    fontSize: 16,
  },
  loader: {
    marginTop: 40,
  },
  callControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 40,
  },
  controlButton: {
    alignItems: "center",
  },
  controlText: {
    color: "#fff",
    marginTop: 5,
    fontSize: 12,
  },
  callActions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
    gap: 30,
  },
  callButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#F44336",
  },
  debugButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  debugText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});

export default CallScreen;
