import React, { useState, useContext } from "react";
import ENVIRONMENT from "../../config/enviroment";
import { AuthContext } from "../../Context/AuthContext";

const ConfigScreen = () => {
    const { user, setUser } = useContext(AuthContext);

    if (!user) return <div>Cargando...</div>;

    const [name, setName] = useState(user.username);
    const [avatar, setAvatar] = useState(user.avatar);
    const [avatarFile, setAvatarFile] = useState(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSaveProfile = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`${ENVIRONMENT.URL_API}/api/users/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("auth_token")
                },
                body: JSON.stringify({ username: name, avatar })
            });

            const data = await res.json();

            if (data.ok) {
                setUser(data.user);
                setMessage({ type: "success", text: "Perfil actualizado correctamente." });
            } else {
                setMessage({ type: "error", text: data.message });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Error al actualizar perfil." });
        }

        setLoading(false);
    };

    const handleChangePassword = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch(`${ENVIRONMENT.URL_API}/api/users/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("auth_token")
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await res.json();

            if (data.ok) {
                setMessage({ type: "success", text: "Contraseña actualizada correctamente." });
                setCurrentPassword("");
                setNewPassword("");
            } else {
                setMessage({ type: "error", text: data.message });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Error al cambiar la contraseña." });
        }

        setLoading(false);
    };

    const handleUploadAvatar = async () => {
        if (!avatarFile) return;

        const formData = new FormData();
        formData.append("avatar", avatarFile);

        const res = await fetch(`${ENVIRONMENT.URL_API}/api/users/update-avatar`, {
            method: "PUT",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("auth_token")
            },
            body: formData
        });

        const data = await res.json();

        if (data.ok) {
            setUser((prev) => ({ ...prev, avatar: data.avatar }));
            setAvatar(data.avatar);
            setMessage({ type: "success", text: "Avatar actualizado." });
        } else {
            setMessage({ type: "error", text: data.message });
        }
    };

return (
    <div className="settings-container">
        <h2 className="settings-title">Ajustes de Cuenta</h2>

        {message && (
            <div className={`settings-message ${message.type}`}>
                {message.text}
            </div>
        )}

        <h3 className="settings-section-title">Editar Perfil</h3>

        <label className="settings-label">Nombre</label>
        <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="settings-input"
        />

        <label className="settings-label">Avatar (Archivo)</label>
        <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files[0])}
            className="settings-file-input"
        />

        <button className="settings-btn upload-btn" onClick={handleUploadAvatar}>
            Subir nuevo avatar
        </button>

        <button
            className="settings-btn save-profile-btn"
            disabled={loading}
            onClick={handleSaveProfile}
        >
            Guardar Perfil
        </button>

        <hr className="settings-divider" />

        <h3 className="settings-section-title">Cambiar Contraseña</h3>

        <label className="settings-label">Contraseña Actual</label>
        <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="settings-input"
        />

        <label className="settings-label">Nueva Contraseña</label>
        <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="settings-input"
        />

        <button
            className="settings-btn change-password-btn"
            disabled={loading}
            onClick={handleChangePassword}
        >
            Cambiar Contraseña
        </button>
    </div>
);

};

export default ConfigScreen;
