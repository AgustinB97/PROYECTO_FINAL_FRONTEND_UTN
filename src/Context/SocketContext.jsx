import { createContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import ENVIRONMENT from "../config/enviroment";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children, userId }) => {
    const socketRef = useRef(null);
    const [socketReady, setSocketReady] = useState(false);

    useEffect(() => {
        if (!userId) return;

        if (!socketRef.current) {
            socketRef.current = io(ENVIRONMENT.URL_API, {
                transports: ["websocket"],
                withCredentials: true,
            });
        }

        const socket = socketRef.current;

        const handleConnect = () => {
            console.log("SOCKET CONECTADO");
            socket.emit("register_user", userId);
            setSocketReady(true);
        };

        const handleDisconnect = () => {
            setSocketReady(false);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
        };
    }, [userId]);

    const joinChat = (chatId) => {
        socketRef.current?.emit("join_chat", chatId);
    };

    const sendMessage = ({ chatId, content, type = "text", senderId }) => {
        socketRef.current?.emit("send_message", {
            chatId,
            content,
            type,
            senderId,
        });
    };

    return (
        <SocketContext.Provider
            value={{
                socketRef,
                socketReady,
                joinChat,
                sendMessage,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};
