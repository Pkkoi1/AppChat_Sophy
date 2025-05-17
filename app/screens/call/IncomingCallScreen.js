import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/app/auth/AuthContext";
import { SocketContext } from "@/app/socket/SocketContext";
import CallService from "@/app/services/CallService";
import AvatarUser from "@/app/components/profile/AvatarUser";
import Color from "@/app/components/colors/Color";

const IncomingCallScreen = ({ route, navigation }) => {
  const { user, callType, callData } = route.params;
  const { userInfo } = useContext(AuthContext);
  const socket = useContext(SocketContext);

  const [callStatus, setCallStatus] = useState("incoming");
  const [callService, setCallService] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    const service = new CallService(socket);
    setCallService(service);

    service.setCallListeners({
      onCallAccepted: () => {
        setCallStatus("connected");
        const interval = setInterval(() => {
          setCallTimer((prev) => prev + 1);
        }, 1000);
        setTimerInterval(interval);
      },
      onCallRejected: () => {
        navigation.goBack();
      },
      onCallEnded: () => {
        navigation.goBack();
      },
      onError: (error) => {
        console.error("Call error:", error);
        navigation.goBack();
      },
    });

    service.registerSocketEvents();

    const setupCall = async () => {
      const stream = await service.initializeCall();
      setLocalStream(stream);
      // Chỉ trả lời khi nhấn accept
    };

    setupCall();

    return () => {
      if (service) {
        service.endCall();
      }
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, []);

  const handleAccept = () => {
    if (callService && callData) {
      callService.answerCall(callData);
      setCallStatus("connected");
    }
  };

  const handleReject = () => {
    if (callService && callData) {
      callService.rejectCall(callData.callerId);
    }
    navigation.goBack();
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  };

  const toggleSpeaker = () => {
    const newSpeakerState = !isSpeakerOn;
    setIsSpeakerOn(newSpeakerState);
    if (callService) {
      callService.setSpeakerphone(newSpeakerState);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.callInfoContainer}>
        <AvatarUser
          fullName={user?.fullname || "User"}
          width={100}
          height={100}
          avtText={40}
          shadow={true}
          bordered={false}
        />
        <Text style={styles.userName}>{user?.fullname || "User"}</Text>
        <Text style={styles.callStatusText}>
          {callStatus === "incoming" ? "Cuộc gọi đến" : formatTime(callTimer)}
        </Text>
      </View>
      {callStatus === "incoming" ? (
        <View style={styles.incomingControlsContainer}>
          <TouchableOpacity
            style={[styles.incomingButton, styles.rejectButton]}
            onPress={handleReject}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.incomingButton, styles.acceptButton]}
            onPress={handleAccept}
          >
            <Ionicons name="call" size={30} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              isMuted ? styles.activeControl : null,
            ]}
            onPress={toggleMute}
          >
            <Ionicons
              name={isMuted ? "mic-off" : "mic"}
              size={30}
              color={isMuted ? Color.blueBackgroundButton : "white"}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.endCallButton} onPress={handleReject}>
            <Ionicons name="call" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.controlButton,
              isSpeakerOn ? styles.activeControl : null,
            ]}
            onPress={toggleSpeaker}
          >
            <Ionicons
              name={isSpeakerOn ? "volume-high" : "volume-medium"}
              size={30}
              color={isSpeakerOn ? Color.blueBackgroundButton : "white"}
            />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2c3e50",
    justifyContent: "space-between",
    padding: 20,
  },
  callInfoContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  userName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
  },
  callStatusText: {
    color: "#e0e0e0",
    fontSize: 16,
    marginTop: 10,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 30,
  },
  incomingControlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  controlButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  activeControl: {
    backgroundColor: "white",
  },
  endCallButton: {
    backgroundColor: "red",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "135deg" }],
  },
  incomingButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "red",
  },
  acceptButton: {
    backgroundColor: "green",
    transform: [{ rotate: "0deg" }],
  },
});

export default IncomingCallScreen;
