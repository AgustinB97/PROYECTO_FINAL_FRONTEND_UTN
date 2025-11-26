import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import ENVIRONMENT from "../config/enviroment";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children, userId }) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chats, setChats] = useState([]);

    useEffect(() => {
        if (!userId) return;

        const s = io(ENVIRONMENT.URL_API, { withCredentials: true });
        setSocket(s);


        s.emit("register_user", userId);


        s.on("new_chat", (chat) => {
            setChats((prev) => {
                if (!prev.some((c) => c._id === chat._id)) {
                    return [chat, ...prev];
                }
                return prev;
            });
        });


        s.on("receive_message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });


        s.on("message_deleted", ({ messageId, chatId, last_message }) => {
            setMessages((prev) => prev.filter((m) => m._id !== messageId));
            setChats((prev) =>
                prev.map((c) =>
                    c._id === chatId ? { ...c, last_message: last_message || null } : c
                )
            );
        });

        return () => {
            s.disconnect();
        };
    }, [userId]);

    const joinChat = (chatId) => {
        if (socket) {
            socket.emit("join_chat", chatId);
        }
    };

    const sendMessage = ({ chatId, content, type = "text" }) => {
        if (socket) {
            socket.emit("send_message", { chatId, content, type, senderId: userId });
        }
    };

    return (
        <SocketContext.Provider value={{ socket, messages, setMessages, chats, setChats, joinChat, sendMessage }}>
            {children}
        </SocketContext.Provider>
    );
};
