// import React, { Component } from "react";
// import ZegoUIKitPrebuiltCall, {
//   ONE_ON_ONE_VIDEO_CALL_CONFIG,
// } from "@zegocloud/zego-uikit-prebuilt-call-rn";
// import { ZEGO_APP_ID, ZEGO_APP_SIGN } from "@env";

// export default function VoiceCallPage(props) {
//   return (
//     <View style={styles.container}>
//       <ZegoUIKitPrebuiltCall
//         appID={ZEGO_APP_ID}
//         appSign={ZEGO_APP_SIGN}
//         userID={userID} // userID can be something like a phone number or the user id on your own user system.
//         userName={userName}
//         callID={callID} // callID can be any unique string.
//         config={{
//           // You can also use ONE_ON_ONE_VOICE_CALL_CONFIG/GROUP_VIDEO_CALL_CONFIG/GROUP_VOICE_CALL_CONFIG to make more types of calls.
//           ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
//           onOnlySelfInRoom: () => {
//             props.navigation.navigate("Home");
//           },
//           onHangUp: () => {
//             props.navigation.navigate("Home");
//           },
//         }}
//       />
//     </View>
//   );
// }
