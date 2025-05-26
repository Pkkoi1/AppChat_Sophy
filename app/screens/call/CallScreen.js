import React, { useState, useEffect, useContext, useRef } from 'react';
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
} from 'react-native';
import { AuthContext } from '@/app/auth/AuthContext';
import { SocketContext } from '@/app/socket/SocketContext';
import AvatarUser from '@/app/components/profile/AvatarUser';
import { Ionicons } from '@expo/vector-icons';
import Color from '@/app/components/colors/Color';
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
} from 'react-native-webrtc';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // Bạn có thể thêm TURN server ở đây nếu cần
  ],
};

const CallScreen = ({ navigation, route }) => {
  const { userInfo } = useContext(AuthContext);
  const socket = useContext(SocketContext);

  const {
    callType,
    isVideo,
    receiver = {}, // add default empty object
    conversationId,
    calleeId,
    callId,
    incoming = false,
  } = route.params || {};

  const [callStatus, setCallStatus] = useState(incoming ? 'incoming' : 'connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const peerConnection = useRef(null);

  // Format call duration as MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer when connected
  useEffect(() => {
    if (callStatus === 'connected') {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    }
  }, [callStatus]);

  // Khi là người gọi, gửi startCall lên server
  useEffect(() => {
    if (!socket || !callId || incoming) return;
    socket.emit('startCall', {
      conversationId,
      roomID: callId,
      callerId: userInfo.userId,
      receiverId: calleeId,
      isVideo
    });
  }, [socket, callId, incoming, conversationId, calleeId, userInfo, isVideo]);

  // Lắng nghe các sự kiện socket
  useEffect(() => {
    if (!socket) return;

    // Khi nhận được startCall (callee)
    socket.on('startCall', (data) => {
      // Nếu chưa ở CallScreen thì điều hướng sang CallScreen với incoming: true
      // Đoạn này thường nằm ở màn hình chờ cuộc gọi đến
    });

    // Khi nhận được callAccepted (caller)
    socket.on('callAccepted', async ({ signal, from }) => {
      console.log('[DEBUG] Nhận callAccepted:', { signal, from });
      await createPeerConnection();
      console.log('[DEBUG] peerConnection khi tạo offer:', peerConnection.current);
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      console.log('[DEBUG] Sau khi setLocalDescription:', peerConnection.current.localDescription);
      socket.emit('callOffer', {
        receiverId: from, // callee userId
        offer,
      });
      setCallStatus('connected');
    });

    // Khi nhận được callOffer (callee)
    socket.on('callOffer', async ({ offer, callerId }) => {
      console.log('[DEBUG] Nhận callOffer:', { offer, callerId });
      await createPeerConnection();
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('[DEBUG] Sau khi setRemoteDescription:', peerConnection.current.remoteDescription);
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      console.log('[DEBUG] Sau khi setLocalDescription:', peerConnection.current.localDescription);
      socket.emit('callSignal', {
        receiverId: callerId,
        signal: answer,
        from: userInfo.userId,
        type: 'answer'
      });
      setCallStatus('connected');
      console.log('[DEBUG] Callee setCallStatus connected');
    });

    // Khi nhận được answer (caller)
    socket.on('callSignal', async ({ signal, from, type }) => {
      if (type === 'answer' && peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
        setCallStatus('connected');
        console.log('[DEBUG] Caller setCallStatus connected');
      }
    });

    // ICE candidate
    socket.on('iceCandidate', async ({ candidate, from }) => {
      if (peerConnection.current && candidate) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // Khi bị từ chối
    socket.on('callRejected', () => {
      Alert.alert("Thông báo", "Cuộc gọi đã bị từ chối");
      navigation.goBack();
    });

    // Khi kết thúc cuộc gọi
    socket.on('callEnded', () => {
      Alert.alert("Thông báo", "Cuộc gọi đã kết thúc");
      navigation.goBack();
    });

    return () => {
      socket.off('callAccepted');
      socket.off('callOffer');
      socket.off('callSignal');
      socket.off('iceCandidate');
      socket.off('callRejected');
      socket.off('callEnded');
    };
  }, [socket]);

  // Khi callee nhấn "Chấp nhận"
  const handleAcceptCall = () => {
    console.log('[DEBUG] handleAcceptCall, peerConnection:', peerConnection.current);
    setCallStatus('connecting');
    if (socket && incoming) {
      const callerId = receiver && receiver.userId ? receiver.userId : calleeId;
      if (!callerId) {
        Alert.alert("Lỗi", "Không xác định được người gọi để trả lời cuộc gọi!");
        return;
      }
      socket.emit('answerCall', {
        callerId,
        from: userInfo.userId,
        signal: null,
      });
    }
  };

  // Kết thúc cuộc gọi
  const handleEndCall = () => {
    if (socket && callId) {
      socket.emit('endCall', {
        conversationId,
        receiverId: incoming ? (receiver && receiver.userId) : calleeId,
        targetId: incoming ? (receiver && receiver.userId) : calleeId,
      });
    }
    if (timerInterval) clearInterval(timerInterval);
    navigation.goBack();
  };

  // Từ chối cuộc gọi
  const handleRejectCall = () => {
    if (socket && incoming) {
      const callerId = receiver && receiver.userId ? receiver.userId : calleeId;
      if (!callerId) {
        Alert.alert("Lỗi", "Không xác định được người gọi để từ chối cuộc gọi!");
        navigation.goBack();
        return;
      }
      socket.emit('rejectCall', {
        callerId,
      });
    }
    navigation.goBack();
  };

  // Khi tạo peer connection, gửi ICE candidate
  const createPeerConnection = async () => {
    if (peerConnection.current) {
      console.log('[DEBUG] peerConnection.current đã tồn tại:', peerConnection.current);
      return peerConnection.current;
    }
    peerConnection.current = new RTCPeerConnection(ICE_SERVERS);
    console.log('[DEBUG] Tạo mới peerConnection:', peerConnection.current);
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        const targetId = incoming ? (receiver && receiver.userId) : calleeId;
        socket.emit('iceCandidate', {
          targetId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.current.onaddstream = (event) => {
      setRemoteStream(event.stream);
    };

    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: isVideo,
    });
    setLocalStream(stream);
    peerConnection.current.addStream(stream);

    return peerConnection.current;
  };

  // Debug log các params khi render
  useEffect(() => {
    // console.log("[DEBUG] CallScreen params:", {
    //   receiver,
    //   calleeId,
    //   callId,
    //   conversationId,
    //   incoming,
    //   callType,
    //   isVideo
    // });
    if (!receiver || !receiver.fullname) {
      console.log("[DEBUG] receiver không có fullname:", receiver);
    }
    if (!receiver || !receiver.urlavatar) {
      console.log("[DEBUG] receiver không có urlavatar:", receiver);
    }
  }, []);

  useEffect(() => {
    // console.log("receiver in CallScreen:", receiver);
  }, [receiver]);

  useEffect(() => {
    if (socket && conversationId) {
      socket.emit('joinUserConversations', [conversationId]);
    }
  }, [socket, conversationId]);

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
          {callStatus === 'connecting'
            ? 'Đang kết nối...'
            : callStatus === 'incoming'
            ? 'Cuộc gọi đến'
            : formatDuration(callDuration)}
        </Text>
      </View>

      {callStatus === 'connecting' && (
        <ActivityIndicator size="large" color={Color.sophy} style={styles.loader} />
      )}

      {/* Hiển thị remote audio/video nếu muốn (tuỳ thư viện WebRTC bạn dùng) */}
      {/* Ví dụ: <RTCView streamURL={remoteStream?.toURL()} style={{width: 200, height: 200}} /> */}

      <View style={styles.callControls}>
        {callStatus === 'connected' && (
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
        {callStatus === 'incoming' ? (
          <>
            <TouchableOpacity style={[styles.callButton, styles.rejectButton]} onPress={handleRejectCall}>
              <Ionicons name="call" size={30} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.callButton, styles.acceptButton]} onPress={handleAcceptCall}>
              <Ionicons name="call" size={30} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.callButton, styles.rejectButton]} onPress={handleEndCall}>
            <Ionicons name="call" size={30} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'space-between',
  },
  callerInfo: {
    alignItems: 'center',
    marginTop: 80,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  callerName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  callStatus: {
    color: '#aaa',
    fontSize: 16,
  },
  loader: {
    marginTop: 40,
  },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 12,
  },
  callActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
    gap: 30,
  },
  callButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
});

export default CallScreen;
