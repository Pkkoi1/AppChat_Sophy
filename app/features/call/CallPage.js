import React from 'react';
import { View, StyleSheet } from 'react-native';
import {ZegoUIKitPrebuiltCall, ONE_ON_ONE_VIDEO_CALL_CONFIG } from '@zegocloud/zego-uikit-prebuilt-call-rn'

export default function CallPage(props) {
    const { navigation } = props;
    const yourAppID = 0; // Replace with your actual AppID
    const yourAppSign = ""; // Replace with your actual AppSign
    const userID =  Math.floor(Math.random() * 100000).toString(); // Replace with your user ID
    const userName = "user_" + userID; // Replace with your user name
    const callID = "test_call_id"; // Replace with your call ID

    return (
        <View style={styles.container}>
            <ZegoUIKitPrebuiltCall
                appID={yourAppID}
                appSign={yourAppSign}
                userID={userID}
                userName={userName}
                callID={callID}
                config={{
                    ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
                    onCallEnd: (callID, reason, duration) => {
                        navigation.navigate('Home'); // Navigate back to the Home page after the call ends
                    },
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 0,
    },
});