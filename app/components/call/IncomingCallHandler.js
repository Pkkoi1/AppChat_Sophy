import React, { useContext, useEffect } from 'react';
import { SocketContext } from '@/app/socket/SocketContext';
import { AuthContext } from '@/app/auth/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { api } from '@/app/api/api';

const IncomingCallHandler = () => {
  const socket = useContext(SocketContext);
  const { userInfo } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = async (data) => {
      try {
        let caller = data.caller;
        if (!caller && data.callerId) {
          const userResponse = await api.getUserById(data.callerId);
          caller = userResponse.data;
        }

        navigation.navigate('CallScreen', {
          callType: data.isVideo ? 'video' : 'voice',
          isVideo: !!data.isVideo,
          receiver: caller,
          conversationId: data.conversationId,
          calleeId: userInfo.userId,
          callId: data.conversationId, // hoặc data.callId nếu backend trả về
          incoming: true,
        });
      } catch (error) {
        console.error('Error handling incoming call:', error);
      }
    };

    socket.on('startCall', handleIncomingCall);

    return () => {
      socket.off('startCall', handleIncomingCall);
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