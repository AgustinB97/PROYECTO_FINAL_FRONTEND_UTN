import { io } from "socket.io-client";
import ENVIRONMENT from "../config/enviroment";
import { createContext, useEffect, useRef, useState } from "react";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children, userId }) => {
    const socketRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [chats, setChats] = useState([]);

    useEffect(() => {
        if (!userId) return;

        socketRef.current = io(ENVIRONMENT.URL_API, { withCredentials: true });

        const s = socketRef.current;
        s.emit("register_user", userId);

        s.on("new_chat", (chat) => {
            setChats((prev) => (prev.some((c) => c._id === chat._id) ? prev : [chat, ...prev]));
        });

        s.on("receive_message", (msg) => setMessages((prev) => [...prev, msg]));
        s.on("message_deleted", ({ messageId, chatId, last_message }) => {
            setMessages((prev) => prev.filter((m) => m._id !== messageId));
            setChats((prev) =>
                prev.map((c) => (c._id === chatId ? { ...c, last_message: last_message || null } : c))
            );
        });

        return () => s.disconnect();
    }, [userId]);

    const joinChat = (chatId) => socketRef.current?.emit("join_chat", chatId);
    const sendMessage = ({ chatId, content, type = "text" }) =>
        socketRef.current?.emit("send_message", { chatId, content, type, senderId: userId });

    return (
        <SocketContext.Provider
            value={{ socket: socketRef.current, messages, setMessages, chats, setChats, joinChat, sendMessage }}
        >
            {children}
        </SocketContext.Provider>
    );
};
