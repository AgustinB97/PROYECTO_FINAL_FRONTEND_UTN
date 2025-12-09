import { createContext, useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketContext";
import { AuthContext } from "./AuthContext";
import { getUserChats, getMessages } from "../services/chatServices";
import ENVIRONMENT from "../config/enviroment";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { socketRef, socketReady } = useContext(SocketContext);
    const { user } = useContext(AuthContext);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);



    useEffect(() => {
        if (!socketRef.current || !user?._id) return;
        socketRef.current.emit("register_user", user._id);
    }, [socketRef, user]);


    useEffect(() => {
        if (!user?._id) return;

        getUserChats(user._id).then(res => {
            if (res.ok) setChats(res.chats);
            else console.error(res.message);
        });
    }, [user]);


    useEffect(() => {
        if (!selectedChat?._id) return;

        getMessages(selectedChat._id).then(res => {
            if (res.ok) setMessages(res.messages);
            else console.error(res.message);
        });
    }, [selectedChat]);


    useEffect(() => {
        const socket = socketRef.current
        console.log(" socket:", socket);
        console.log(" user:", user);
        console.log(" chats:", chats);
        console.log(" chats.length:", chats.length);
        if (!socketReady || !user?._id || chats.length === 0) return;

        console.log("UNIENDO A SALAS:", chats.map(c => c._id));

        const joinChat = (chatId) => {
            socket.emit("join_chat", chatId);
        };

        chats.forEach(chat => {
            joinChat(chat._id);
        });

    }, [socketReady, user, chats.length]);


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
        if (!socketReady) return;
        const socket = socketRef.current;

        const handleNewChat = (chat) => {
            setChats(prev => {
                if (prev.some(c => c._id === chat._id)) return prev;
                return [chat, ...prev];
            });
        };

        const handleReceiveMessage = (data) => {
            console.log("receive_message recibido:", data);

            const chatId = data.chatId;
            const msg = data.message;

            updateChatLastMessage(chatId, msg);

            if (selectedChat?._id === chatId) {
                setMessages(prev => [...prev, msg]);
            }
        };

        const handleMessageDeleted = ({ chatId, messageId, last_message }) => {

            console.log("EVENTO message_deleted RECIBIDO:");
            console.log("chatId:", chatId);
            console.log("messageId:", messageId);
            console.log("last_message:", last_message);

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

    }, [socketReady, selectedChat]);


    const deleteMessage = async (chatId, messageId) => {
        const socket = socketRef.current
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
