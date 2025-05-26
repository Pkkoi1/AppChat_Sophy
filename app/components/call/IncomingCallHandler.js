import React, { useContext, useEffect } from "react";
import { SocketContext } from "@/app/socket/SocketContext";
import { AuthContext } from "@/app/auth/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { api } from "@/app/api/api";

const IncomingCallHandler = () => {
  const { socket } = useContext(SocketContext);
  const { userInfo } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = async (data) => {
      try {
        console.log('[IncomingCall] Nhận cuộc gọi đến:', data);
        
        // Kiểm tra nếu đang trong một cuộc gọi khác
        if (navigation.getState().routes.some(route => route.name === 'CallScreen')) {
          console.log('[IncomingCall] Đang trong cuộc gọi khác, từ chối cuộc gọi mới');
          socket.emit('rejectCall', {
            callerId: data.callerId,
            reason: 'user_busy'
          });
          return;
        }

        let caller = data.caller;
        if (!caller && data.callerId) {
          const userResponse = await api.getUserById(data.callerId);
          caller = userResponse.data;
        }

        // Điều hướng đến màn hình cuộc gọi
        navigation.navigate('CallScreen', {
          callType: data.isVideo ? 'video' : 'voice',
          isVideo: !!data.isVideo,
          receiver: caller,
          conversationId: data.conversationId,
          calleeId: userInfo.userId,
          callId: data.callId || data.conversationId,
          incoming: true,
        });
        
        // Gửi sự kiện đã nhận cuộc gọi
        socket.emit('callReceived', {
          callerId: data.callerId,
          callId: data.callId || data.conversationId,
          receiverId: userInfo.userId
        });
        
      } catch (error) {
        console.error("Error handling incoming call:", error);
        // Gửi thông báo lỗi nếu cần
        if (socket && data?.callerId) {
          socket.emit('callError', {
            callerId: data.callerId,
            callId: data.callId,
            error: 'internal_error'
          });
        }
      }
    };

    // Lắng nghe sự kiện cuộc gọi đến
    socket.on('startCall', handleIncomingCall);

    // Lắng nghe sự kiện kết thúc cuộc gọi từ xa
    const handleCallEnded = (data) => {
      console.log('[IncomingCall] Cuộc gọi đã kết thúc:', data);
      // Điều hướng về màn hình trước nếu đang ở màn hình cuộc gọi
      if (navigation.getState().routes.some(route => route.name === 'CallScreen')) {
        navigation.goBack();
      }
    };
    
    socket.on('callEnded', handleCallEnded);

    return () => {
      socket.off('startCall', handleIncomingCall);
      socket.off('callEnded', handleCallEnded);
    };
  }, [socket, navigation, userInfo]);

  useEffect(() => {
    if (!socket || !userInfo?.userId) return;
    socket.emit('authenticate', userInfo.userId);
  }, [socket, userInfo]);

  useEffect(() => {
    if (!socket) return;

    socket.on('callAccepted', async ({ signal, from }) => {
      console.log('[CallScreen] Nhận callAccepted từ backend:', { signal, from });
      try {
        
      } catch (err) {
        console.error('[CallScreen] Lỗi khi tạo/gửi offer:', err);
      }
    });

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

    socket.on('callSignal', async ({ signal, from, type }) => {
      console.log('[CallScreen] Nhận callSignal:', { signal, from, type });
      if (type === 'answer' && peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
        setCallStatus('connected');
        console.log('[DEBUG] Caller setCallStatus connected');
      }
    });

    socket.on('iceCandidate', async ({ candidate, from }) => {
      console.log('[CallScreen] Nhận iceCandidate:', { candidate, from });
      if (peerConnection.current && candidate) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('[CallScreen] Đã addIceCandidate');
      }
    });

    return () => {
      socket.off('callAccepted');
      socket.off('callOffer');
      socket.off('callSignal');
      socket.off('iceCandidate');
    };
  }, [socket]);

  const createPeerConnection = async () => {
    if (peerConnection.current) {
      console.log('[CallScreen] peerConnection.current đã tồn tại:', peerConnection.current);
      return peerConnection.current;
    }
    peerConnection.current = new RTCPeerConnection(ICE_SERVERS);
    console.log('[CallScreen] Tạo mới peerConnection:', peerConnection.current);
    // ... các event handler
    // ... addStream
    return peerConnection.current;
  };

  return null; // This component doesn't render anything
};

export default IncomingCallHandler;
