import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';

const CallScreen = ({ route, navigation }) => {
  const { callType, user, incoming } = route.params;
  const userID = user.userId; // Giả sử receiver có userId
  const userName = user.fullname; // Giả sử receiver có fullname
  const callID = `call_${userID}_${Date.now()}`; // Tạo callID duy nhất

  useEffect(() => {
    if (incoming) {
      // Xử lý cuộc gọi đến (nếu cần)
      console.log('Incoming call from:', userName);
    }

    return () => {
      // Kết thúc cuộc gọi khi rời màn hình
      ZegoUIKitPrebuiltCallService.hangUp();
      navigation.goBack();
    };
  }, [incoming, userName, navigation]);

  return (
    <View style={styles.container}>
      <ZegoUIKitPrebuiltCallService.CallView
        callID={callID}
        userID={userID}
        userName={userName}
        isVideoCall={callType === 'video'}
        onHangUp={() => navigation.goBack()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CallScreen;