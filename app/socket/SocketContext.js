import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DATABASE_API, MY_IP, SOCKET_SERVER_URL } from "@env";

// Ưu tiên local nếu có MY_IP, nếu không thì fallback render
const SOCKET_URL = SOCKET_SERVER_URL;

// Hàm kiểm tra socket local có kết nối được không
const checkLocalSocketAvailable = async () => {
  return new Promise((resolve) => {
    try {
      const testSocket = io(SOCKET_SERVER_URL, {
        transports: ["websocket"],
        timeout: 2000,
        reconnection: false,
      });
      testSocket.on("connect", () => {
        testSocket.disconnect();
        resolve(true);
      });
      testSocket.on("connect_error", () => {
        testSocket.disconnect();
        resolve(false);
      });
      setTimeout(() => {
        testSocket.disconnect();
        resolve(false);
      }, 2000);
    } catch {
      resolve(false);
    }
  });
};

(async () => {
  if (await checkLocalSocketAvailable()) {
    SOCKET_URL = SOCKET_SERVER_URL;
    console.log("Sử dụng socket local:", SOCKET_URL);
  } else {
    SOCKET_URL = "https://sophy-chatapp-be.onrender.com";
    console.log("Sử dụng socket render:", SOCKET_URL);
  }
})();

export const SocketContext = createContext(null);

export const SocketProvider = React.memo(({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const socketRef = useRef(null);

  const authenticateSocket = useCallback(async (socketInstance) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (userId && socketInstance?.connected) {
        socketInstance.emit("authenticate", userId);
        console.log("Sent authenticate event with userId:", userId);
      } else {
        console.warn(
          "No userId found or socket not connected for authentication"
        );
      }
    } catch (error) {
      console.error("Error fetching userId from AsyncStorage:", error);
    }
  }, []);

  const initializeSocket = useCallback(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      pingInterval: 25000,
      pingTimeout: 60000,
    });

    newSocket.on("connect", () => {
      console.log("Socket Connected:", newSocket.id);
      authenticateSocket(newSocket);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket Connection Error:", error);
      setIsAuthenticated(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(
        "Socket Reconnected (attempt #",
        attemptNumber,
        "):",
        newSocket.id
      );
      authenticateSocket(newSocket);
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log("Attempting to reconnect:", attemptNumber);
    });

    newSocket.on("reconnecting", (attemptNumber) => {
      console.log("Reconnecting:", attemptNumber);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("Reconnect Error:", error);
      setIsAuthenticated(false);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("Reconnect Failed");
      setIsAuthenticated(false);
      // Khởi tạo lại socket sau 5 giây
      setTimeout(() => {
        if (!socketRef.current?.connected) {
          console.log("Re-initializing socket after reconnect failure...");
          initializeSocket();
        }
      }, 5000);
    });

    newSocket.on("authenticated", () => {
      setIsAuthenticated(true);
      console.log("Socket authenticated");
    });

    newSocket.on("unauthorized", () => {
      setIsAuthenticated(false);
      console.log("Socket unauthorized");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket Disconnected:", reason);
      setIsAuthenticated(false);
      if (reason !== "io server disconnect") {
        setTimeout(() => {
          if (!newSocket.connected) {
            console.log("Attempting to auto-reconnect socket...");
            newSocket.connect();
          }
        }, 2000);
      }
    });

    setSocket(newSocket);
    socketRef.current = newSocket;
    return newSocket;
  }, [authenticateSocket]);

  useEffect(() => {
    if (!socketRef.current || !socketRef.current.connected) {
      initializeSocket();
    }

    // Bỏ cleanup để giữ socket sống khi chuyển màn hình
    // return () => {
    //   if (socketRef.current) {
    //     console.log("Disconnecting socket...");
    //     socketRef.current.disconnect();
    //     socketRef.current = null;
    //   }
    // };
  }, [initializeSocket]);

  // Hàm để ngắt kết nối socket khi đăng xuất
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsAuthenticated(false);
      console.log("Socket manually disconnected");
    }
  }, []);

  return (
    <SocketContext.Provider
      value={{ socket, isAuthenticated, disconnectSocket }}
    >
      {children}
    </SocketContext.Provider>
  );
});
