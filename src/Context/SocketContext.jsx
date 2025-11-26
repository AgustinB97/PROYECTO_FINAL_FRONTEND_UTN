import { io } from "socket.io-client";
import ENVIRONMENT from "../config/enviroment";
import { createContext, useEffect, useRef } from "react";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children, userId }) => {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!userId) return;

        socketRef.current = io(ENVIRONMENT.URL_API, { withCredentials: true });
        const socket = socketRef.current;

        socket.emit("register_user", userId);

        return () => socket.disconnect();
    }, [userId]);

    const joinChat = (chatId) => socketRef.current?.emit("join_chat", chatId);

    const sendMessage = ({ chatId, content, type = "text" }) =>
        socketRef.current?.emit("send_message", {
            chatId,
            content,
            type,
            senderId: userId
        });

    return (
        <SocketContext.Provider value={{ socketRef, joinChat, sendMessage }}>
            {children}
        </SocketContext.Provider>
    );
};
