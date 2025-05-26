import React, { useContext, useEffect } from "react";
import { SocketContext } from "@/app/socket/SocketContext";
import { AuthContext } from "@/app/auth/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { api } from "@/app/api/api";

const IncomingCallHandler = () => {
  const { socket } = useContext(SocketContext);
  const { userInfo } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = async (data) => {
      try {
        // Get caller information if not included in the data
        let caller = data.caller;
        if (!caller && data.callerId) {
          const userResponse = await api.getUserById(data.callerId);
          caller = userResponse.data;
        }

        // Navigate to the call screen
        navigation.navigate("CallScreen", {
          callType: "voice",
          user: caller,
          incoming: true,
          callData: data,
        });
      } catch (error) {
        console.error("Error handling incoming call:", error);
      }
    };

    // Listen for incoming call events
    socket.on("incomingCall", handleIncomingCall);

    return () => {
      socket.off("incomingCall", handleIncomingCall);
    };
  }, [socket, navigation, userInfo]);

  return null; // This component doesn't render anything
};

export default IncomingCallHandler;
