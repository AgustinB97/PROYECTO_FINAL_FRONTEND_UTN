import { createContext, useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketContext";
import { AuthContext } from "./AuthContext";
import { getUserChats } from "../services/chatServices";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { socket } = useContext(SocketContext);
    const { user } = useContext(AuthContext);

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);

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

    const addChatIfNotExists = (chat) => {
        setChats(prev => {
            if (prev.some(c => c._id === chat._id)) return prev;
            return [chat, ...prev];
        });
    };

    const deleteMessage = async (chatId, messageId) => {
    try {
        const res = await fetch(`${ENVIRONMENT.URL_API}/api/chat/message/${messageId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        const data = await res.json();
        if (!data.ok) {
            console.error(data.message);
            return;
        }

        socket?.emit("delete_message", {
            chatId,
            messageId
        });

        updateChatLastMessage(chatId, data.last_message ?? null);

    } catch (err) {
        console.error("Error eliminando mensaje:", err);
    }
};


    useEffect(() => {
        if (!user?._id) return;

        getUserChats(user._id).then(res => {
            if (res.ok) setChats(res.chats);
            else console.error(res.message);
        });
    }, [user]);

    useEffect(() => {
        if (!socket || !user?._id || chats.length === 0) return;

        socket.emit("join_user", user._id);

        chats.forEach(chat => {
            socket.emit("join_chat", chat._id);
        });

    }, [socket, user, chats.length]);

    useEffect(() => {
        if (!socket) return;

        const handleNewChat = (chat) => {
            addChatIfNotExists(chat);
            moveChatToTop(chat._id);
        };

        const handleReceiveMessage = (msg) => {
            const rawId = msg.chatId;
            const chatId = rawId?._id || rawId;

            if (!chatId) {
                console.error("ERROR: msg.chatId inválido", msg);
                return;
            }

            setChats(prev => {
                const exists = prev.find(c => c._id === chatId);

                if (!exists) {
                    const newChat = {
                        _id: chatId,
                        members: rawId?.members || [],
                        isGroup: rawId?.isGroup || false,
                        name: rawId?.name || "Nuevo chat",
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

    }, [socket]);

    return (
        <ChatContext.Provider value={{
            chats,
            setChats,
            selectedChat,
            setSelectedChat,
            deleteMessage
        }}>
            {children}
        </ChatContext.Provider>
    );
};