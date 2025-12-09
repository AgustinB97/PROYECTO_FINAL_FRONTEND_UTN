import React, { useContext, useState } from "react";
import { ChatContext } from "../../Context/ChatContext";
import { AuthContext } from "../../Context/AuthContext";
import { SocketContext } from "../../Context/SocketContext";
import ENVIRONMENT from "../../config/enviroment";

const ChatScreen = () => {
    const { selectedChat, setSelectedChat, messages, deleteMessage } = useContext(ChatContext);
    const { user } = useContext(AuthContext);
    const { sendMessage } = useContext(SocketContext);
    const [text, setText] = useState("");
    const [isGroupSettings, setIsGroupSettings] = useState(false);

    const isAdmin = Boolean(
        selectedChat?.isGroup &&
        Array.isArray(selectedChat?.admins) &&
        selectedChat.admins.some(a =>
            a &&
            a._id &&
            user?._id &&
            String(a._id) === String(user._id)
        )
    );

    const send = (e) => {
        e.preventDefault();
        if (!text.trim() || !selectedChat?._id) return;
        console.log("ENVIANDO AL SOCKET:", {
            chatId: selectedChat._id,
            content: text,
            senderId: user._id
        });
        sendMessage({
            chatId: selectedChat._id,
            content: text,
            type: "text",
            senderId: user._id,
        });

        setText("");
    };

    const addUserToGroup = async (userId) => {
        const res = await fetch(`${ENVIRONMENT.URL_API}/api/chat/${selectedChat._id}/add-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        });

        const data = await res.json();
        if (data.ok) setSelectedChat(data.group);
        else alert(data.message);
    };

    const removeUserFromGroup = async (userId) => {
        const res = await fetch(`${ENVIRONMENT.URL_API}/api/chat/${selectedChat._id}/remove-user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        });

        const data = await res.json();
        if (data.ok) setSelectedChat(data.group);
        else alert(data.message);
    };

    if (!selectedChat) return <p>Cargando chat...</p>;


    return (
        <div className="chat-screen">
            {/* HEADER */}
            <div className="contact-nav">
                <div className="contact-nav__avatar-name">
                    <img src={selectedChat.avatar || "/default-avatar.png"} className="contact-nav__avatar" alt="avatar" />
                    <h3 className="contact-nav__name">{selectedChat.name}</h3>
                </div>
                {selectedChat.isGroup && isAdmin && (
                    <button className="group-settings-btn" onClick={() => setIsGroupSettings(prev => !prev)}>⚙️</button>
                )}
            </div>

            {/* CHAT / SETTINGS */}
            {isGroupSettings ? (
                <div className="group-settings">

                    <h2 className="group-settings-title">Configuración del grupo</h2>

                    {/* MIEMBROS */}
                    <h3 className="group-settings-subtitle">Miembros</h3>
                    {selectedChat.members.map((m) => (
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
                        .filter((u) => !selectedChat.members.some((m) => String(m._id) === String(u._id)))
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
                                        {!isMine && selectedChat?.isGroup && msg.sender?.avatar && (
                                            <img src={msg.sender.avatar} className="msg-avatar" alt="avatar" />
                                        )}
                                        <div className="msg-bubble">{msg.content}</div>
                                        <span className="message-hour">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        {isMine && (
                                            <button className="delete-message-btn" disabled={!msg._id} onClick={() => deleteMessage(selectedChat._id, msg._id)}>🗑</button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="send-message">
                        <form className="send-message__form" onSubmit={send}>
                            <input
                                className="send-message__input"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
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
