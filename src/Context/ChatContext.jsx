import { createContext, useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketContext";
import { AuthContext } from "./AuthContext";
import { getUserChats } from "../services/chatServices";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { socketRef } = useContext(SocketContext);
    const { user } = useContext(AuthContext);

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);

    useEffect(() => {
        if (!user?._id) return;

        getUserChats(user._id).then(res => {
            if (res.ok) setChats(res.chats);
            else console.error(res.message);
        });
    }, [user]);

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket || !user?._id) return;

        socket.emit("join_user", user._id);

        chats.forEach(chat => {
            socket.emit("join_chat", chat._id);
        });

    }, [user, chats]);

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        const handleNewChat = (chat) => {
            setChats(prev => {
                if (prev.some(c => c._id === chat._id)) return prev;
                return [chat, ...prev];
            });
        };

        const handleReceiveMessage = (msg) => {
            const chatId = msg.chatId._id || msg.chatId;

            setChats(prev => {
                const exists = prev.find(c => c._id === chatId);

                if (!exists) {
                    const newChat = {
                        _id: chatId,
                        members: msg.chatId.members || [],
                        isGroup: msg.chatId.isGroup,
                        name: msg.chatId.name || null,
                        last_message: msg
                    };
                    return [newChat, ...prev];
                }

                const updated = prev.map(c =>
                    c._id === chatId ? { ...c, last_message: msg } : c
                );

                const moved = updated.find(c => c._id === chatId);
                const rest = updated.filter(c => c._id !== chatId);
                return [moved, ...rest];
            });
        };

        const handleMessageDeleted = ({ chatId, last_message }) => {
            setChats(prev =>
                prev.map(c =>
                    c._id === chatId
                        ? { ...c, last_message: last_message || null }
                        : c
                )
            );
        };

        socket.on("new_chat", handleNewChat);
        socket.on("receive_message", handleReceiveMessage);
        socket.on("message_deleted", handleMessageDeleted);

        return () => {
            socket.off("new_chat", handleNewChat);
            socket.off("receive_message", handleReceiveMessage);
            socket.off("message_deleted", handleMessageDeleted);
        };

    }, []);

    return (
        <ChatContext.Provider value={{
            chats,
            setChats,
            selectedChat,
            setSelectedChat
        }}>
            {children}
        </ChatContext.Provider>
    );
};