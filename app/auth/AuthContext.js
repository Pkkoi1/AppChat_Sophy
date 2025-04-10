// import React, { createContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { api } from "@/app/api/api";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [authToken, setAuthToken] = useState(null);
//   const [refreshToken, setRefreshToken] = useState(null);
//   const [userInfo, setUserInfo] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const loadStorage = async () => {
//       try {
//         const [token, refresh, user] = await AsyncStorage.multiGet([
//           "authToken",
//           "refreshToken",
//           "userInfo",
//         ]);

//         if (token[1] && refresh[1] && user[1]) {
//           setAuthToken(token[1]);
//           setRefreshToken(refresh[1]);
//           setUserInfo(JSON.parse(user[1]));
//         }
//       } catch (err) {
//         console.error("Error loading storage:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadStorage();
//   }, []);

//   const login = async (params) => {
//     const response = await api.login(params);
//     const { accessToken, refreshToken } = response.data.token;

//     setAuthToken(accessToken);
//     setRefreshToken(refreshToken);

//     await getUserInfoById(response.data.user.userId);
//   };

//   const logout = async () => {
//     try {
//       await api.logout();
//     } catch (error) {
//       console.error("Lỗi khi logout:", error.message);
//     } finally {
//       setAuthToken(null);
//       setRefreshToken(null);
//       setUserInfo(null);
//     }
//   };

//   const getUserInfoById = async (id) => {
//     try {
//       const res = await api.getUserById(id);
//       setUserInfo(res.data);
//       await AsyncStorage.setItem("userInfo", JSON.stringify(res.data));
//     } catch (err) {
//       console.error("Error fetching user info:", err);
//     }
//   };

//   const updateUserInfo = async (newInfo) => {
//     const updated = { ...userInfo, ...newInfo };
//     setUserInfo(updated);
//     await AsyncStorage.setItem("userInfo", JSON.stringify(updated));
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         authToken,
//         refreshToken,
//         userInfo,
//         isLoading,
//         login,
//         logout,
//         updateUserInfo,
//         getUserInfoById,
//         setUserInfo,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };


import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/app/api/api";
import { SocketContext } from "../screens/socket/SocketContext"; // Import SocketContext

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useContext(SocketContext); // Get socket from context

  useEffect(() => {
    const loadStorage = async () => {
      try {
        const [token, refresh, user] = await AsyncStorage.multiGet([
          "authToken",
          "refreshToken",
          "userInfo",
        ]);

        if (token[1] && refresh[1] && user[1]) {
          setAuthToken(token[1]);
          setRefreshToken(refresh[1]);
          setUserInfo(JSON.parse(user[1]));
        }
      } catch (err) {
        console.error("Error loading storage:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorage();
  }, []);

  const login = async (params) => { // Modified to accept socket
    const response = await api.login(params);
    const { accessToken, refreshToken } = response.data.token;

    setAuthToken(accessToken);
    setRefreshToken(refreshToken);

    await getUserInfoById(response.data.user.userId);
    console.log("Sockettttttttt: ", socket);
    console.log("Emitteddd 'authenticate' event with userId:", response.data.user.userId);
    // Emit the 'authenticate' event after successful login
    if (socket && response.data.user.userId) {
      socket.emit("authenticate", response.data.user.userId);
      console.log("Emitted 'authenticate' event with userId:", response.data.user.userId);
    }
    ////////////////////////////////////////////////////////
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Lỗi khi logout:", error.message);
    } finally {
      setAuthToken(null);
      setRefreshToken(null);
      setUserInfo(null);
    }
  };

  const getUserInfoById = async (id) => {
    try {
      const res = await api.getUserById(id);
      setUserInfo(res.data);
      await AsyncStorage.setItem("userInfo", JSON.stringify(res.data));
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

  const updateUserInfo = async (newInfo) => {
    const updated = { ...userInfo, ...newInfo };
    setUserInfo(updated);
    await AsyncStorage.setItem("userInfo", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        refreshToken,
        userInfo,
        isLoading,
        login,
        logout,
        updateUserInfo,
        getUserInfoById,
        setUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};