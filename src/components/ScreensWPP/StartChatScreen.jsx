import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import ENVIRONMENT from "../../config/enviroment";
import { SocketContext } from "../../Context/SocketContext";
import { ChatContext } from "../../Context/ChatContext";


const StartChatScreen = () => {
    const { socketRef } = useContext(SocketContext);
    const { setChats, setSelectedChat } = useContext(ChatContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [groupName, setGroupName] = useState("");
    const [groupAvatar, setGroupAvatar] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    if (!user) return <p>Cargando usuario...</p>;

    useEffect(() => {
        async function loadUsers() {
            try {
                const res = await fetch(`${ENVIRONMENT.URL_API}/api/users`);
                const data = await res.json();

                if (data.ok) {
                    setUsers(data.users.filter(u => u._id !== user._id));
                }
            } catch (err) {
                console.error("Error cargando usuarios:", err);
            }
        }
        loadUsers();
    }, [user]);


    const startPrivateChat = async (otherUserId) => {
        setLoading(true);

        try {
            const body = {
                userAId: user._id,
                userBId: otherUserId
            };

            const res = await fetch(`${ENVIRONMENT.URL_API}/api/chat/private`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            setLoading(false);

            if (!data.ok) return;

            setChats(prev => {
                const exists = prev.find(c => c._id === data.chat._id);
                if (exists) return prev;

                return [data.chat, ...prev];
            });

            socketRef.current.emit("new_chat", data.chat);

            setSelectedChat(data.chat);

            navigate(`/home/chat/${data.chat._id}`);

    } catch (error) {
        console.error("Error iniciando chat privado:", error);
    }
};




const toggleSelect = (id) => {
    setSelectedUsers(prev =>
        prev.includes(id)
            ? prev.filter(u => u !== id)
            : [...prev, id]
    );
};


const createGroup = async () => {
    try {
        if (!groupName.trim() || selectedUsers.length < 2) {
            return alert("El grupo necesita un nombre y al menos 2 miembros")
        };

        setLoading(true);

        const body = {
            name: groupName,
            ownerId: user._id,
            participants: [...selectedUsers],
            avatar: null
        };

        const res = await fetch(`${ENVIRONMENT.URL_API}/api/chat/group/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (data.ok) {

            setChats(prev => [data.group, ...prev]);


            socketRef.current.emit("new_chat", data.group);


            setSelectedChat(data.group);

            setTimeout(() => {
                setLoading(false)
                navigate(`/home/chat/${data.group._id}`)
            }, 200);
        }

    } catch (err) {
        console.error("Error creando grupo:", err);
    }
};



return (
    <div className="start-chat-screen">

        <h2 className="header">Iniciar Chat o Crear Grupo</h2>

        {message && (
            <div className={`alert ${message.type}`}>
                {message.text}
            </div>
        )}

        {/* Lista de usuarios */}
        <h3 className="users">Usuarios</h3>

        <ul className="users-list">
            {users.map(u => (
                <li className="user" key={u._id}>
                    <img
                        className="avatar"
                        src={u.avatar || "/default-avatar.png"}
                    />

                    <span className="username">{u.username}</span>

                    <button className="chat-btn" onClick={() => startPrivateChat(u._id)}>
                        Chatear
                    </button>

                    <input
                        className="input-group"
                        type="checkbox"
                        checked={selectedUsers.includes(u._id)}
                        onChange={() => toggleSelect(u._id)}
                    />
                </li>
            ))}
        </ul>

        {/* Crear grupo */}
        <h3 className="groups-create">Crear Grupo</h3>

        <label className="group-name">Nombre del grupo</label>
        <input
            className="input-create-group"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
        />

        <label className="avatar-group">Avatar (URL opcional)</label>
        <input
            className="avatar-input"
            type="text"
            value={groupAvatar}
            onChange={(e) => setGroupAvatar(e.target.value)}
        />

        <button className="create-group-btn" onClick={createGroup} disabled={loading}>
            Crear Grupo
        </button>
    </div>
);

};

export default StartChatScreen;
