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
            if (!res.ok) return console.error(res.message);

            setChats(prev => {
                const combined = [...prev];

                res.chats.forEach(chat => {
                    if (!combined.some(c => c._id === chat._id)) {
                        combined.push(chat);
                    }
                });

                return combined;
            });
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
        if (!socketReady || !user?._id || chats.length === 0) return;

        console.log("UNIENDO A SALAS:", chats.map((c) => c._id));

        chats.forEach((chat) => {
            socket.emit("join_chat", chat._id);
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
        if (!socket) return;

        const handleNewChat = (chat) => {
            const socket = socketRef.current;

            setChats(prev => {
                if (prev.some(c => c._id === chat._id)) return prev;
                return [chat, ...prev];
            });

            socket.emit("join_chat", chat._id);

            setSelectedChat(prev => prev ?? chat);
        };


        const handleReceiveMessage = ({ chatId, message }) => {
            console.log("receive_message recibido:", { chatId, message });


            updateChatLastMessage(chatId, message);

            setSelectedChat(prev => {
                if (prev?._id === chatId) {
                    setMessages(m => [...m, message]);
                }
                return prev;
            });
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

    }, [socketReady]);


    const deleteMessage = async (chatId, messageId) => {
        try {
            const res = await fetch(`${ENVIRONMENT.URL_API}/api/chat/message/${messageId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();
            if (!data.ok) return console.error(data.message);

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
