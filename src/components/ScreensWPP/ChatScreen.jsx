import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import { SocketContext } from "../../Context/SocketContext";
import { ChatContext } from "../../Context/ChatContext";
import ENVIRONMENT from "../../config/enviroment";

const ChatScreen = () => {
    const { id: chatId } = useParams();
    const { user } = useContext(AuthContext);
    const { socketRef } = useContext(SocketContext);
    const { chats, setChats } = useContext(ChatContext);

    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [value, setValue] = useState("");
    const [isGroupSettings, setIsGroupSettings] = useState(false);
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        if (!chatId || !user) return;

        async function loadChat() {
            try {
                const res = await fetch(`${ENVIRONMENT.URL_API}/api/chat/${chatId}`);
                const data = await res.json();
                if (!data.ok) return console.error(data.message);

                let c = data.chat;
                if (!c) return;


                if (!c.isGroup) {
                    const other = Array.isArray(c.members)
                        ? c.members.find((m) => String(m._id) !== String(user._id))
                        : null;

                    c = {
                        ...c,
                        name: other?.username || "Usuario",
                        avatar: other?.avatar || "/default-avatar.png",
                    };
                }

                setChat(c);
                setMessages(Array.isArray(data.messages) ? data.messages : []);


                setChats(prev =>
                    prev.map(ch =>
                        ch._id === chatId
                            ? { ...ch, last_message: data.messages.slice(-1)[0] || null }
                            : ch
                    )
                );
            } catch (e) {
                console.error("Error cargando chat:", e);
            }
        }

        loadChat();
    }, [chatId, user, setChats]);


    useEffect(() => {
        const socket = socketRef.current;
        if (!socket || !chatId) return;

        socket.emit("join_chat", chatId);

        const handleNewMessage = (msg) => {
            const id = msg.chatId._id || msg.chatId;
            if (id !== chatId) return;

            setMessages(prev => [...prev, msg]);

            setChats(prev =>
                prev.map(ch =>
                    ch._id === chatId ? { ...ch, last_message: msg } : ch
                )
            );
        };

        const handleDeleteMessage = ({ messageId, chatId: deletedChatId, last_message }) => {
            if (deletedChatId !== chatId) return;

            setMessages(prev => prev.filter(m => m._id !== messageId));

            setChats(prev =>
                prev.map(ch =>
                    ch._id === chatId ? { ...ch, last_message: last_message || null } : ch
                )
            );
        };

        socket.on("receive_message", handleNewMessage);
        socket.on("message_deleted", handleDeleteMessage);

        return () => {
            socket.off("receive_message", handleNewMessage);
            socket.off("message_deleted", handleDeleteMessage);
        };
    }, [socketRef, chatId, setChats]);


    const sendMessage = async (e) => {
        e.preventDefault();
        if (!value.trim()) return;

        const socket = socketRef.current;


        const optimistic = {
            sender: { _id: user._id },
            content: value,
            chatId,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimistic]);
        setValue("");

        const res = await fetch(`${ENVIRONMENT.URL_API}/api/chat/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chatId,
                senderId: user._id,
                content: value,
            }),
        });

        const saved = await res.json();

        if (saved.ok && socket)
            socket.emit("send_message", saved.message);
    };


    const deleteMessage = async (messageId) => {
        const socket = socketRef.current;

        try {
            const res = await fetch(`${ENVIRONMENT.URL_API}/api/chat/message/${messageId}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (!data.ok) return alert(data.message);

            setMessages(prev => prev.filter(m => m._id !== messageId));

            if (socket)
                socket.emit("delete_message", { messageId, chatId: chat._id });

        } catch (err) {
            console.error("Error eliminando mensaje:", err);
        }
    };


    useEffect(() => {
        if (!isGroupSettings) return;

        async function loadAllUsers() {
            try {
                const res = await fetch(`${ENVIRONMENT.URL_API}/api/users`);
                const data = await res.json();

                if (data.ok) setAllUsers(data.users);
            } catch (err) {
                console.error("Error cargando usuarios:", err);
            }
        }

        loadAllUsers();
    }, [isGroupSettings]);


    const addUserToGroup = async (userId) => {
        const res = await fetch(`${ENVIRONMENT.URL_API}/api/chat/${chatId}/add-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        });

        const data = await res.json();
        if (data.ok) setChat(data.group);
        else alert(data.message);
    };

    const removeUserFromGroup = async (userId) => {
        const res = await fetch(`${ENVIRONMENT.URL_API}/api/chat/${chatId}/remove-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        });

        const data = await res.json();
        if (data.ok) setChat(data.group);
        else alert(data.message);
    };

    if (!chat) return <p>Cargando chat...</p>;

    const isAdmin = chat.admins?.some(a => String(a._id) === String(user._id));

    return (
        <div className="chat-screen">
            {/* HEADER */}
            <div className="contact-nav">
                <div className="contact-nav__avatar-name">
                    <img src={chat.avatar || "/default-avatar.png"} className="contact-nav__avatar" alt="avatar" />
                    <h3 className="contact-nav__name">{chat.name}</h3>
                </div>
                {chat.isGroup && isAdmin && (
                    <button className="group-settings-btn" onClick={() => setIsGroupSettings(prev => !prev)}>⚙️</button>
                )}
            </div>

            {/* CHAT / SETTINGS */}
            {isGroupSettings ? (
                <div className="group-settings">

                    <h2 className="group-settings-title">Configuración del grupo</h2>

                    {/* MIEMBROS */}
                    <h3 className="group-settings-subtitle">Miembros</h3>
                    {chat.members.map((m) => (
                        <div key={m._id} className="group-user-row">
                            <img src={m.avatar} className="group-user-avatar" />
                            <span className="group-user-name">{m.username}</span>

                            {m._id !== user._id && (
                                <button
                                    onClick={() => removeUserFromGroup(m._id)}
                                    className="group-btn remove-btn"
                                >
                                    ❌
                                </button>
                            )}
                        </div>
                    ))}

                    {/* AÑADIR USUARIOS */}
                    <h3 className="group-settings-subtitle">Añadir usuarios</h3>
                    {allUsers
                        .filter((u) => !chat.members.some((m) => m._id === u._id))
                        .map((u) => (
                            <div key={u._id} className="group-user-row">
                                <img src={u.avatar} className="group-user-avatar" />
                                <span className="group-user-name">{u.username}</span>

                                <button
                                    onClick={() => addUserToGroup(u._id)}
                                    className="group-btn add-btn"
                                >
                                    ➕
                                </button>
                            </div>
                        ))}
                </div>
            ) : (
                <>
                    <div className="chat">
                        <ul className="chat-list">
                            {messages.map((msg, index) => {
                                const isMine = (msg.sender?._id ?? msg.sender) === user._id;
                                return (
                                    <li key={msg._id || index} className={`message ${isMine ? "message__me" : "message__other"}`}>
                                        {!isMine && chat?.isGroup && msg.sender?.avatar && (
                                            <img src={msg.sender.avatar} className="msg-avatar" alt="avatar" />
                                        )}
                                        <div className="msg-bubble">{msg.content}</div>
                                        <span className="message-hour">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        {isMine && (
                                            <button className="delete-message-btn" disabled={!msg._id} onClick={() => deleteMessage(msg._id)}>🗑</button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="send-message">
                        <form className="send-message__form" onSubmit={sendMessage}>
                            <input
                                className="send-message__input"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder="Escribe un mensaje"
                            />
                            <button type="submit" className="send-message__send-btn">Enviar</button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatScreen;
