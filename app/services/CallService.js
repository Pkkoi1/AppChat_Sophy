import {
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    mediaDevices,
  } from 'react-native-webrtc';
  import InCallManager from 'react-native-incall-manager';
  
  export class CallService {
    constructor(socket) {
      this.socket = socket;
      this.peerConnection = null;
      this.localStream = null;
      this.remoteStream = null;
      this.callListeners = {
        onCallReceived: null,
        onCallAccepted: null,
        onCallRejected: null,
        onCallEnded: null,
        onStreamReceived: null,
        onError: null,
      };
  
      // ICE server configuration
      this.configuration = {
        iceServers: [
          {
            urls: [
              'stun:stun.l.google.com:19302',
              'stun:stun1.l.google.com:19302',
            ],
          },
        ],
      };
    }
  
    // Register socket event listeners
    registerSocketEvents() {
      if (!this.socket) return;
  
      // Incoming call event
      this.socket.on('incomingCall', async (data) => {
        if (this.callListeners.onCallReceived) {
          this.callListeners.onCallReceived(data);
        }
      });
  
      // Call accepted event
      this.socket.on('callAccepted', async (data) => {
        try {
          await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.sdp)
          );
          if (this.callListeners.onCallAccepted) {
            this.callListeners.onCallAccepted(data);
          }
        } catch (error) {
          this.handleError(error);
        }
      });
  
      // Call rejected event
      this.socket.on('callRejected', (data) => {
        if (this.callListeners.onCallRejected) {
          this.callListeners.onCallRejected(data);
        }
      });
  
      // Call ended event
      this.socket.on('callEnded', () => {
        this.endCall();
        if (this.callListeners.onCallEnded) {
          this.callListeners.onCallEnded();
        }
      });
  
      // New ICE candidate received
      this.socket.on('newIceCandidate', async (data) => {
        try {
          if (this.peerConnection) {
            await this.peerConnection.addIceCandidate(
              new RTCIceCandidate(data.candidate)
            );
          }
        } catch (error) {
          this.handleError(error);
        }
      });
    }
  
    // Set event listeners
    setCallListeners(listeners) {
      this.callListeners = { ...this.callListeners, ...listeners };
    }
  
    // Initialize call
    async initializeCall() {
      try {
        // Get user media (audio only for voice calls)
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: false, // Set to true for video calls
        });
        this.localStream = stream;
  
        // Start audio session
        InCallManager.start({ media: 'audio' });
        InCallManager.setForceSpeakerphoneOn(false);
  
        return stream;
      } catch (error) {
        this.handleError(error);
        return null;
      }
    }
  
    // Make a call
    async makeCall(receiverId) {
      try {
        if (!this.localStream) {
          await this.initializeCall();
        }
  
        this.createPeerConnection();
  
        // Add local stream to peer connection
        this.localStream.getTracks().forEach((track) => {
          this.peerConnection.addTrack(track, this.localStream);
        });
  
        // Create offer
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
  
        // Send offer to receiver
        this.socket.emit('callUser', {
          receiverId: receiverId, 
          sdp: this.peerConnection.localDescription,
          callerId: this.socket.userInfo.userId,
          callerName: this.socket.userInfo.fullname,
        });
      } catch (error) {
        this.handleError(error);
      }
    }
  
    // Answer a call
    async answerCall(callData) {
      try {
        if (!this.localStream) {
          await this.initializeCall();
        }
  
        this.createPeerConnection();
  
        // Add local stream to peer connection
        this.localStream.getTracks().forEach((track) => {
          this.peerConnection.addTrack(track, this.localStream);
        });
  
        // Set remote description (caller's offer)
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(callData.sdp)
        );
  
        // Create answer
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
  
        // Send answer to caller
        this.socket.emit('answerCall', {
          callerId: callData.callerId,
          sdp: this.peerConnection.localDescription,
        });
      } catch (error) {
        this.handleError(error);
      }
    }
  
    // Create peer connection
    createPeerConnection() {
      this.peerConnection = new RTCPeerConnection(this.configuration);
  
      // Handle ICE candidate events
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.socket.emit('iceCandidate', {
            candidate: event.candidate,
            to: this.currentCallId,
          });
        }
      };
  
      // Handle track events
      this.peerConnection.ontrack = (event) => {
        this.remoteStream = event.streams[0];
        if (this.callListeners.onStreamReceived) {
          this.callListeners.onStreamReceived(this.remoteStream);
        }
      };
    }
  
    // Reject a call
    rejectCall(callerId) {
      this.socket.emit('rejectCall', { callerId });
    }
  
    // End a call
    endCall() {
      // Stop media tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          track.stop();
        });
        this.localStream = null;
      }
  
      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
  
      // Stop audio session
      InCallManager.stop();
  
      // Emit end call event
      this.socket.emit('endCall', { to: this.currentCallId });
      this.currentCallId = null;
    }
  
    // Handle errors
    handleError(error) {
      console.error('CallService error:', error);
      if (this.callListeners.onError) {
        this.callListeners.onError(error);
      }
    }
  }
  
  export default CallService;