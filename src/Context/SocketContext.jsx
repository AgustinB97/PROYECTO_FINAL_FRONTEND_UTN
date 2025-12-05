import { io } from "socket.io-client";
import ENVIRONMENT from "../config/enviroment";
import { createContext, useEffect, useRef, useState } from "react";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children, userId }) => {
    const socketRef = useRef(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!userId) return;

        const newSocket = io(ENVIRONMENT.URL_API, { withCredentials: true });

        socketRef.current = newSocket;
        
        setSocket(newSocket);

        newSocket.emit("register_user", userId);

        return () => newSocket.disconnect();
    }, [userId]);

    const joinChat = (chatId) => socket?.emit("join_chat", chatId);

    const sendMessage = ({ chatId, content, type = "text" }) =>
        socket?.emit("send_message", {
            chatId,
            content,
            type,
            senderId: userId
        });

    return (
        <SocketContext.Provider value={{ socket, socketRef, joinChat, sendMessage }}>
            {children}
        </SocketContext.Provider>
    );
};
