import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { 
  ZegoUIKitPrebuiltCall, 
  ONE_ON_ONE_VIDEO_CALL_CONFIG,
  GROUP_VIDEO_CALL_CONFIG 
} from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../auth/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ZEGO_APP_ID, ZEGO_APP_SIGN } from '../../config/zegoConfig';

const VideoCallScreen = () => {
  const { userInfo } = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();
  const { isGroupCall, callId, callees } = route.params || {};
  
  // Generate a unique call ID if not provided
  const callRoomID = callId || `call_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  
  // Check if ZegoCloud credentials are configured
  useEffect(() => {
    if (!ZEGO_APP_ID || !ZEGO_APP_SIGN) {
      Alert.alert(
        "Configuration Missing",
        "ZegoCloud configuration is incomplete. Please set your App ID and App Sign in zegoConfig.js",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  }, []);

  // Configure user information for the call
  const userID = userInfo?.userId?.toString() || "unknown_user";
  const userName = userInfo?.fullname || "User";
  
  return (
    <SafeAreaView style={styles.container}>
      {ZEGO_APP_ID && ZEGO_APP_SIGN ? (
        <ZegoUIKitPrebuiltCall
          appID={ZEGO_APP_ID}
          appSign={ZEGO_APP_SIGN}
          userID={userID}
          userName={userName}
          callID={callRoomID}
          config={{
            ...(isGroupCall ? GROUP_VIDEO_CALL_CONFIG : ONE_ON_ONE_VIDEO_CALL_CONFIG),
            onOnlySelfInRoom: () => {
              navigation.navigate('Home');
            },
            onHangUp: () => {
              navigation.navigate('Home');
            },
          }}
        />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>ZegoCloud configuration is missing</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VideoCallScreen;
