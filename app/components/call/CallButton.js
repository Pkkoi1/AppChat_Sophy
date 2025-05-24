import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { initiateCall } from '../../screens/call/CallUtils';
import { useNavigation } from '@react-navigation/native';

/**
 * Call button component for initiating calls
 * @param {Object} props - Component props
 * @param {string} props.calleeId - ID of user to call (for 1:1 calls)
 * @param {Array} props.groupMembers - Group members (for group calls)
 * @param {string} props.conversationId - Conversation ID
 * @param {boolean} props.isVideo - Whether to start a video call
 * @param {Object} props.style - Additional styles for the button
 */
const CallButton = ({ 
  calleeId, 
  groupMembers, 
  conversationId, 
  isVideo = true, 
  style 
}) => {
  const navigation = useNavigation();
  
  const handleCall = async () => {
    try {
      await initiateCall({
        calleeId,
        groupMembers,
        isVideo,
        conversationId,
        navigation
      });
    } catch (error) {
      console.error('Error starting call:', error);
      // You might want to show an alert here
    }
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handleCall}
    >
      <Ionicons 
        name={isVideo ? "videocam" : "call"} 
        size={22} 
        color="#fff" 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default CallButton;
