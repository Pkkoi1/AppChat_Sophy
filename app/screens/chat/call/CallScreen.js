// import React from "react";
// import { View, StyleSheet } from "react-native";
// import ZegoUIKitPrebuiltCall, {
//   ONE_ON_ONE_VIDEO_CALL_CONFIG,
//   ONE_ON_ONE_VOICE_CALL_CONFIG,
// } from "@zegocloud/zego-uikit-prebuilt-call-rn";
// import { ZEGO_APP_ID, ZEGO_APP_SIGN } from "@env";

// export default function CallScreen({ route, navigation }) {
//   // Lấy tham số từ navigation
//   const { callType, user, incoming } = route.params || {};

//   // Tạo các giá trị cần thiết cho Zego
//   const userID =
//     user?.id?.toString() || "user_" + Math.floor(Math.random() * 10000);
//   const userName = user?.fullname || "Unknown";
//   const callID = "call_" + (user?.id || Math.floor(Math.random() * 10000));

//   // Chọn config cho voice hoặc video call
//   const config =
//     callType === "voice"
//       ? {
//           ...ONE_ON_ONE_VOICE_CALL_CONFIG,
//           onOnlySelfInRoom: () => navigation.goBack(),
//           onHangUp: () => navigation.goBack(),
//         }
//       : {
//           ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
//           onOnlySelfInRoom: () => navigation.goBack(),
//           onHangUp: () => navigation.goBack(),
//         };

//   return (
//     <View style={styles.container}>
//       <ZegoUIKitPrebuiltCall
//         appID={Number(ZEGO_APP_ID)}
//         appSign={ZEGO_APP_SIGN}
//         userID={userID}
//         userName={userName}
//         callID={callID}
//         config={config}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });
