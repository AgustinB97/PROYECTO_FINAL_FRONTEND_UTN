import { createContext, useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketContext";
import { AuthContext } from "./AuthContext";
import { getUserChats, getChatMessages } from "../services/chatServices";
import ENVIRONMENT from "../config/enviroment";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { socket } = useContext(SocketContext);
    const { user } = useContext(AuthContext);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);


    useEffect(() => {
        if (!user?._id) return;

        getUserChats(user._id).then(res => {
            if (res.ok) setChats(res.chats);
            else console.error(res.message);
        });
    }, [user]);


    useEffect(() => {
        if (!selectedChat?._id) return;

        getChatMessages(selectedChat._id).then(res => {
            if (res.ok) setMessages(res.messages);
            else console.error(res.message);
        });
    }, [selectedChat]);


    useEffect(() => {
        if (!socket || !user?._id || chats.length === 0) return;

        socket.emit("join_user", user._id);
        chats.forEach(chat => socket.emit("join_chat", chat._id));

    }, [socket, user, chats.length]);


    const moveChatToTop = (chatId) => {
        setChats(prev => {
            const found = prev.find(c => c._id === chatId);
            if (!found) return prev;

            const rest = prev.filter(c => c._id !== chatId);
            return [found, ...rest];
        });
    };

    const updateChatLastMessage = (chatId, last_message) => {
        setChats(prev =>
            prev.map(c =>
                c._id === chatId ? { ...c, last_message } : c
            )
        );
        moveChatToTop(chatId);
    };


    useEffect(() => {
        if (!socket) return;

        const handleNewChat = (chat) => {
            setChats(prev => {
                if (prev.some(c => c._id === chat._id)) return prev;
                return [chat, ...prev];
            });
        };

        const handleReceiveMessage = (msg) => {
            const chatId = msg.chatId._id || msg.chatId;

            updateChatLastMessage(chatId, msg);

            if (selectedChat?._id === chatId) {
                setMessages(prev => [...prev, msg]);
            }
        };

        const handleMessageDeleted = ({ chatId, messageId, last_message }) => {


            if (selectedChat?._id === chatId) {
                setMessages(prev => prev.filter(m => m._id !== messageId));
            }


            updateChatLastMessage(chatId, last_message || null);
        };

        socket.on("new_chat", handleNewChat);
        socket.on("receive_message", handleReceiveMessage);
        socket.on("message_deleted", handleMessageDeleted);

        return () => {
            socket.off("new_chat", handleNewChat);
            socket.off("receive_message", handleReceiveMessage);
            socket.off("message_deleted", handleMessageDeleted);
        };

    }, [socket, selectedChat]);


    const deleteMessage = async (chatId, messageId) => {
        try {
            const res = await fetch(`${ENVIRONMENT.URL_API}/api/chat/message/${messageId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();
            if (!data.ok) return console.error(data.message);

            socket?.emit("delete_message", { chatId, messageId });
            updateChatLastMessage(chatId, data.last_message ?? null);

            setMessages(prev => prev.filter(m => m._id !== messageId));

        } catch (err) {
            console.error("Error eliminando mensaje:", err);
        }
    };

    return (
        <ChatContext.Provider value={{
            chats,
            selectedChat,
            messages,
            setSelectedChat,
            deleteMessage
        }}>
            {children}
        </ChatContext.Provider>
    );
};
