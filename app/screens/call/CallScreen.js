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
  RTCView,
} from 'react-native-webrtc';
import { Audio } from 'expo-av';
import { Linking } from 'react-native';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // Bạn có thể thêm TURN server ở đây nếu cần
  ],
};

const CallScreen = ({ navigation, route }) => {
  const { userInfo } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const callInitialized = useRef(false);

  const {
    callType,
    isVideo,
    receiver = {},
    conversationId,
    calleeId,
    callId,
    incoming = false,
  } = route.params || {};

  const [callStatus, setCallStatus] = useState(incoming ? 'incoming' : 'connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [micPermissionRequesting, setMicPermissionRequesting] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [cameraPermissionRequesting, setCameraPermissionRequesting] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [showCamera, setShowCamera] = useState(isVideo);

  const peerConnection = useRef(null);

  // Toggle speaker
  const toggleSpeaker = async () => {
    console.log('[DEBUG] toggleSpeaker called - Current speaker state:', isSpeakerOn);
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: !isSpeakerOn, // Fixed: should be opposite of isSpeakerOn
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false, // Always use speaker by default
      });
      setIsSpeakerOn(!isSpeakerOn);
    } catch (error) {
      console.error('[ERROR] Error toggling speaker:', error);
      Alert.alert('Lỗi', 'Không thể thay đổi chế độ loa');
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!hasMicPermission) {
      Alert.alert(
        'Quyền truy cập micro',
        'Vui lòng cấp quyền truy cập micro để sử dụng tính năng này',
        [
          { text: 'Đóng', style: 'cancel' },
          { text: 'Đi đến cài đặt', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    const newMuteState = !isMuted;
    setIsMuted(newMuteState);

    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !newMuteState;
      });
    }
  };

  // Format call duration as MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Request permissions
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        setMicPermissionRequesting(true);
        const { status } = await Audio.requestPermissionsAsync();
        setHasMicPermission(status === 'granted');
        setMicPermissionRequesting(false);

        if (isVideo) {
          setCameraPermissionRequesting(true);
          const cameraStatus = await mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then(() => 'granted')
            .catch(() => 'denied');
          setHasCameraPermission(cameraStatus === 'granted');
          setCameraPermissionRequesting(false);
        }
      } catch (error) {
        console.error('[ERROR] Error requesting permissions:', error);
        Alert.alert('Lỗi', 'Không thể yêu cầu quyền truy cập thiết bị');
        setMicPermissionRequesting(false);
        setCameraPermissionRequesting(false);
      }
    };

    requestPermissions();
  }, [isVideo]);

  // Start timer when connected
  useEffect(() => {
    if (callStatus === 'connected') {
      const interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
      setTimerInterval(interval);
    } else if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    return () => clearInterval(timerInterval);
  }, [callStatus]);

  // Initialize local stream
  const initializeLocalStream = async () => {
    if (!hasMicPermission || (isVideo && !hasCameraPermission)) {
      console.warn('[WARN] Missing permissions for stream initialization');
      return;
    }

    try {
      // Set audio mode before getting media
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const stream = await mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        },
        video: isVideo
          ? {
              facingMode: isFrontCamera ? 'user' : 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 },
            }
          : false,
      });

      // Set initial audio track state
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMuted;
      }

      setLocalStream(stream);

      if (peerConnection.current) {
        stream.getTracks().forEach(track => {
          peerConnection.current.addTrack(track, stream);
        });
      }
    } catch (error) {
      console.error('[ERROR] Error initializing local stream:', error);
      Alert.alert('Lỗi', 'Không thể khởi tạo luồng video', [
        { text: 'OK', style: 'cancel' },
        { 
          text: 'Thử lại', 
          onPress: () => initializeLocalStream() 
        }
      ]);
    }
  };

  // Handle local stream initialization when permissions or call status change
  useEffect(() => {
    if (callStatus === 'connected' && !localStream) {
      initializeLocalStream();
    }
  }, [callStatus, hasMicPermission, hasCameraPermission]);

  // Handle camera switch
  const switchCamera = async () => {
    if (!localStream || !isVideo) return;

    setIsFrontCamera(prev => !prev);

    try {
      // Stop existing video tracks
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.stop();
        localStream.removeTrack(track);
      });

      // Get new video stream with updated facing mode
      const newStream = await mediaDevices.getUserMedia({
        video: {
          facingMode: isFrontCamera ? 'environment' : 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      localStream.addTrack(newVideoTrack);

      // Update peer connection
      if (peerConnection.current) {
        const senders = peerConnection.current.getSenders();
        const videoSender = senders.find(sender => sender.track?.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(newVideoTrack);
        } else {
          peerConnection.current.addTrack(newVideoTrack, localStream);
        }
      }
    } catch (error) {
      console.error('[ERROR] Error switching camera:', error);
      Alert.alert('Lỗi', 'Không thể đổi camera');
    }
  };

  // Handle peer connection
  const createPeerConnection = async () => {
    if (peerConnection.current) return peerConnection.current;

    try {
      peerConnection.current = new RTCPeerConnection(ICE_SERVERS);

      peerConnection.current.ontrack = event => {
        console.log('[DEBUG] Received remote track:', event.streams);
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      peerConnection.current.onicecandidate = event => {
        if (event.candidate) {
          console.log('[DEBUG] Sending ICE candidate:', event.candidate);
          socket.emit('iceCandidate', {
            receiverId: incoming ? receiver?.userId : calleeId,
            candidate: event.candidate,
            callId,
          });
        }
      };

      peerConnection.current.onconnectionstatechange = () => {
        console.log('[DEBUG] Connection state:', peerConnection.current.connectionState);
        if (peerConnection.current.connectionState === 'connected') {
          setCallStatus('connected');
          setShowCamera(isVideo);
        }
      };

      return peerConnection.current;
    } catch (error) {
      console.error('[ERROR] Error creating peer connection:', error);
      throw error;
    }
  };

  // Socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('startCall', data => {
      // Handle incoming call (already handled by route.params)
    });

    socket.on('callAccepted', async ({ signal, from }) => {
      try {
        await createPeerConnection();
        if (signal) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket.emit('callSignal', {
            receiverId: from,
            signal: answer,
            from: userInfo?.userId,
            type: 'answer',
            callId,
            conversationId,
          });
        }
        setCallStatus('connected');
        setShowCamera(isVideo);
      } catch (error) {
        console.error('[ERROR] Error handling callAccepted:', error);
        Alert.alert('Lỗi', 'Không thể thiết lập kết nối');
        handleEndCall();
      }
    });

    socket.on('callOffer', async ({ offer, callerId }) => {
      try {
        await createPeerConnection();
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit('callSignal', {
          receiverId: callerId,
          signal: answer,
          from: userInfo?.userId,
          type: 'answer',
          callId,
          conversationId,
        });
        setCallStatus('connected');
        setShowCamera(isVideo);
      } catch (error) {
        console.error('[ERROR] Error handling callOffer:', error);
        Alert.alert('Lỗi', 'Không thể thiết lập kết nối');
        handleEndCall();
      }
    });

    socket.on('callSignal', async ({ signal, from, type }) => {
      if (!peerConnection.current) return;

      try {
        const sessionDescription = new RTCSessionDescription(signal);
        if (type === 'answer') {
          await peerConnection.current.setRemoteDescription(sessionDescription);
          setCallStatus('connected');
          setShowCamera(isVideo);
        } else if (type === 'offer' && incoming) {
          await peerConnection.current.setRemoteDescription(sessionDescription);
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket.emit('callSignal', {
            receiverId: from,
            signal: answer,
            from: userInfo?.userId,
            type: 'answer',
            callId,
            conversationId,
          });
          setCallStatus('connected');
          setShowCamera(isVideo);
        }
      } catch (error) {
        console.error('[ERROR] Error handling callSignal:', error);
        Alert.alert('Lỗi', 'Không thể thiết lập kết nối');
        handleEndCall();
      }
    });

    socket.on('iceCandidate', async ({ candidate, from, callId: incomingCallId }) => {
      if (incomingCallId !== callId || !peerConnection.current) return;

      try {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate({
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex,
          })
        );
      } catch (error) {
        console.error('[ERROR] Error adding ICE candidate:', error);
      }
    });

    socket.on('callRejected', () => {
      Alert.alert('Thông báo', 'Cuộc gọi đã bị từ chối');
      navigation.goBack();
    });

    socket.on('callEnded', () => {
      Alert.alert('Thông báo', 'Cuộc gọi đã kết thúc');
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
  }, [socket, callId, incoming, conversationId, calleeId, userInfo, isVideo]);

  // Handle accept call
  const handleAcceptCall = async () => {
    if (!socket || !socket.connected) {
      Alert.alert('Lỗi', 'Mất kết nối mạng. Vui lòng thử lại!');
      return;
    }

    try {
      const callerId = receiver?.userId || calleeId;
      if (!callerId) throw new Error('Không xác định được người gọi!');
      await createPeerConnection();
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit('answerCall', {
        callerId,
        from: userInfo?.userId,
        signal: offer,
        callId,
        conversationId,
      });
      setCallStatus('connecting');
    } catch (error) {
      console.error('[ERROR] Error accepting call:', error);
      Alert.alert('Lỗi', 'Không thể chấp nhận cuộc gọi!');
      navigation.goBack();
    }
  };

  // Handle end call
  const handleEndCall = () => {
    if (socket && callId) {
      socket.emit('endCall', {
        conversationId,
        receiverId: incoming ? receiver?.userId : calleeId,
        targetId: incoming ? receiver?.userId : calleeId,
      });
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (timerInterval) clearInterval(timerInterval);
    navigation.goBack();
  };

  // Handle reject call
  const handleRejectCall = () => {
    if (socket && incoming) {
      const callerId = receiver?.userId || calleeId;
      if (!callerId) {
        Alert.alert('Lỗi', 'Không xác định được người gọi!');
        navigation.goBack();
        return;
      }
      socket.emit('rejectCall', { callerId });
    }
    navigation.goBack();
  };

  // Initialize call for caller
  useEffect(() => {
    if (!socket || !socket.connected || !callId || incoming || callInitialized.current) return;

    callInitialized.current = true;
    socket.emit('startCall', {
      conversationId,
      roomID: callId,
      callerId: userInfo?.userId,
      receiverId: calleeId,
      isVideo,
    });
  }, [socket, callId, incoming, conversationId, calleeId, userInfo, isVideo]);

  // Join conversation
  useEffect(() => {
    if (socket && conversationId) {
      socket.emit('joinUserConversations', [conversationId]);
    }
  }, [socket, conversationId]);

  // Handle loading state
  if (!socket || !socket.connected) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Color.primary} />
        <Text style={styles.connectingText}>Đang kết nối...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      {isVideo && showCamera && (
        <>
          <View style={styles.videoContainer}>
            {remoteStream && (
              <RTCView
                streamURL={remoteStream.toURL()}
                style={styles.remoteVideo}
                objectFit="cover"
                mirror={false}
              />
            )}
          </View>
          {localStream && (
            <View style={styles.localVideoContainer}>
              <RTCView
                streamURL={localStream.toURL()}
                style={styles.localVideo}
                objectFit="cover"
                mirror={true}
              />
            </View>
          )}
        </>
      )}
      <View style={styles.callerInfo}>
        {receiver?.urlavatar ? (
          <Image source={{ uri: receiver.urlavatar }} style={styles.avatar} />
        ) : (
          <AvatarUser
            fullName={receiver?.fullname || 'Unknown'}
            width={100}
            height={100}
            avtText={40}
          />
        )}
        <Text style={styles.callerName}>{receiver?.fullname || 'Unknown'}</Text>
        <Text style={styles.callStatus}>
          {callStatus === 'connecting'
            ? 'Đang kết nối...'
            : callStatus === 'incoming'
            ? 'Cuộc gọi đến'
            : formatDuration(callDuration)}
        </Text>
      </View>

      {(micPermissionRequesting || cameraPermissionRequesting) && (
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color={Color.sophy} />
          <Text style={styles.permissionText}>
            Đang yêu cầu quyền truy cập {micPermissionRequesting ? 'micro' : 'camera'}...
          </Text>
        </View>
      )}

      <View style={styles.controlContainer}>
        {callStatus === 'connected' && (
          <>
            <TouchableOpacity
              style={[styles.controlButton, isMuted && styles.controlButtonActive]}
              onPress={toggleMute}
            >
              <Ionicons
                name={isMuted ? 'mic-off' : 'mic'}
                size={24}
                style={[styles.controlIcon, isMuted]}
              />
              <Text style={[styles.controlText, isMuted ]}>
                {isMuted ? 'Đã tắt mic' : 'Mở mic'}
              </Text>
            </TouchableOpacity>
            {isVideo && (
              <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
                <Ionicons name="camera-reverse" size={24} style={styles.controlIcon} />
                <Text style={styles.controlText}>Đổi cam</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.controlButton, !isSpeakerOn && styles.controlButtonActive]}
              onPress={toggleSpeaker}
            >
              <Ionicons
                name={isSpeakerOn ? 'volume-high' : 'volume-mute'}
                size={24}
                style={[styles.speakerIcon, !isSpeakerOn ]}
              />
              <Text style={[styles.speakerText, !isSpeakerOn ]}>
                {isSpeakerOn ? 'Loa ngoài' : 'Tai nghe'}
              </Text>
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
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  localVideoContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 120,
    height: 160,
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    zIndex: 100,
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
  },
  callerInfo: {
    alignItems: 'center',
    marginTop: 80,
    zIndex: 10,
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
  permissionContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  controlContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 35,
    width: 65,
    height: 65,
    justifyContent: 'center',
    padding: 10,
  },
  controlButtonActive: {
    backgroundColor: '#ff3b30',
  },
  controlIcon: {
    fontSize: 24,
    color: '#fff',
  },
  controlIconMuted: {
    color: '#ff3b30',
  },
  controlText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
  },
  controlTextMuted: {
    color: '#ff3b30',
  },
  speakerIcon: {
    fontSize: 24,
    color: '#fff',
  },
  speakerIconMuted: {
    color: '#ff3b30',
  },
  speakerText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
  },
  speakerTextMuted: {
    color: '#ff3b30',
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
  connectingText: {
    marginTop: 20,
    color: '#fff',
    fontSize: 16,
  },
});

export default CallScreen;