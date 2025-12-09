import { createContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import ENVIRONMENT from "../config/enviroment";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const [socketReady, setSocketReady] = useState(false);


    useEffect(() => {
        if (socketRef.current) return;
        const s = io(ENVIRONMENT.URL_API, {
            transports: ["websocket"],
            withCredentials: true,
        });
        socketRef.current = s;

        s.on("connect", () => {
            console.log("SOCKET CONNECTED", socket.id);
            setSocketReady(true);
        });

        s.on("disconnect", () => {
            console.log("SOCKET DISCONNECTED");
            setSocketReady(false);
        });

        return () => {
            try {
                s.disconnect();
            } catch (e) {
                console.warn("Error al desconectar socket:", e);
            }
        };
    }, []);

    const joinChat = (chatId) => {
        socketRef.current?.emit("join_chat", chatId);
    };

    const sendMessage = ({ chatId, content, type = "text", senderId }) => {
        socketRef.current?.emit("send_message", { chatId, content, type, senderId });
    };

    return (
        <SocketContext.Provider value={{ socketRef, socketReady, joinChat, sendMessage }}>
            {children}
        </SocketContext.Provider>
    );
};
