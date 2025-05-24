import { api } from '../../api/api';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SocketContext } from '../../socket/SocketContext';
import { useContext } from 'react';

/**
 * Initiate a call to another user or group
 * @param {Object} options - Call options
 * @param {string} options.calleeId - ID of the user being called (for 1:1 calls)
 * @param {Array} options.groupMembers - Array of group members (for group calls)
 * @param {boolean} options.isVideo - Whether this is a video call
 * @param {string} options.conversationId - Conversation ID
 * @param {Function} options.navigation - Navigation object
 */
export const initiateCall = async ({ 
  calleeId, 
  groupMembers, 
  isVideo = true, 
  conversationId, 
  navigation 
}) => {
  try {
    // Determine call type
    const isGroupCall = !!groupMembers && groupMembers.length > 1;
    const callId = `call_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
    // Send call invitation through socket
    const socket = useContext(SocketContext);
    if (socket) {
      socket.emit('callInvitation', {
        callerId: userInfo.userId,
        callerName: userInfo.fullname,
        calleeId: calleeId,
        groupMembers: isGroupCall ? groupMembers : undefined,
        conversationId,
        callId,
        isVideo,
        timestamp: new Date().toISOString()
      });
    }
    
    // Navigate to call screen
    navigation.navigate('VideoCall', {
      isGroupCall,
      callId,
      callees: isGroupCall ? groupMembers : [calleeId],
    });
    
    return callId;
  } catch (error) {
    console.error('Error initiating call:', error);
    throw error;
  }
};

/**
 * Request permission for notifications (needed for call notifications)
 */
export const requestNotificationPermission = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('call-channel', {
      name: 'Call Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#007AFF',
    });
  }
  
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

/**
 * Set up notification listener for incoming calls
 * @param {Function} navigation - Navigation object
 */
export const setupCallNotificationListener = (navigation) => {
  const notificationListener = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    
    if (data.type === 'call') {
      navigation.navigate('VideoCall', {
        isGroupCall: data.isGroupCall,
        callId: data.callId,
        callees: data.callees,
      });
    }
  });
  
  return notificationListener;
};
