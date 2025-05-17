// import ZegoUIKitPrebuiltCallService, {
//   GROUP_VIDEO_CALL_CONFIG,
//   GROUP_VOICE_CALL_CONFIG,
//   ONE_ON_ONE_VIDEO_CALL_CONFIG,
//   ONE_ON_ONE_VOICE_CALL_CONFIG,
//   ZegoInvitationType,
// } from "@zegocloud/zego-uikit-prebuilt-call-rn";
// import { ZegoMenuBarButtonName } from "@zegocloud/zego-uikit-prebuilt-call-rn/lib/commonjs/services/defines";
// import * as ZIM from "zego-zim-react-native";
// import * as ZPNs from "zego-zpns-react-native";
// import { ZEGO_APP_ID, ZEGO_APP_SIGN } from "@env";

// ZegoUIKitPrebuiltCallService.useSystemCallingUI([ZIM, ZPNs]);

// const onUserLogin = async (userID, userName, props) => {
//   return ZegoUIKitPrebuiltCallService.init(
//     ZEGO_APP_ID,
//     ZEGO_APP_SIGN,
//     String(userID),
//     userName,
//     [ZIM, ZPNs],
//     {
//       ringtoneConfig: {
//         incomingCallFileName: "incoming.mp3",
//         outgoingCallFileName: "outgoing.mp3",
//       },
//       androidNotificationConfig: {
//         channelID: "ZegoUIKit",
//         channelName: "ZegoUIKit",
//       },
//       requireConfig: (data) => {
//         const callConfig =
//           data.invitees.length > 1
//             ? ZegoInvitationType.videoCall === data.type
//               ? GROUP_VIDEO_CALL_CONFIG
//               : GROUP_VOICE_CALL_CONFIG
//             : ZegoInvitationType.videoCall === data.type
//             ? ONE_ON_ONE_VIDEO_CALL_CONFIG
//             : ONE_ON_ONE_VOICE_CALL_CONFIG;
//         return {
//           ...callConfig,
//           useSpeakerWhenJoining: false,
//           topMenuBarConfig: {
//             buttons: [ZegoMenuBarButtonName.minimizingButton],
//           },
//         };
//       },
//       notifyWhenAppRunningInBackgroundOrQuit: true,
//       isIOSSandboxEnvironment: true, // Đặt thành false nếu dùng môi trường production
//     }
//   );
// };

// const onUserLogout = async () => {
//   return ZegoUIKitPrebuiltCallService.uninit();
// };

// export { onUserLogin, onUserLogout };
