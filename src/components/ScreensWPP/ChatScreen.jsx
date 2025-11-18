import React, { useState, useEffect, useContext } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";

const ChatScreen = () => {
	const { contactList } = useOutletContext();
	const { id } = useParams();

	const { user, isLogged } = useContext(AuthContext);

	const contactId = id;                    // 🔥 ID del contacto (string, MongoId)
	const userId = user?._id;                // 🔥 El ID real del usuario desde el token

	const contact = contactList.find(c => c.id === contactId);

	const [messages, setMessages] = useState([]);
	const [value, setValue] = useState("");

	if (!isLogged || !user) {
		return <div>Cargando usuario...</div>;
	}

	if (!contact) {
		return <div>No se encontró este contacto.</div>;
	}

	// 🔥 1 — Cargar la conversación cuando entra al chat
	useEffect(() => {
		async function loadMessages() {
			try {
				const res = await fetch(
					`http://localhost:8080/api/chat/${userId}/${contactId}`
				);

				const data = await res.json();
				if (data.ok) {
					setMessages(data.messages);
				}
			} catch (error) {
				console.error("Error cargando mensajes:", error);
			}
		}

		loadMessages();
	}, [contactId, userId]);

	// 🔥 2 — Enviar mensaje
	const sendMessage = async (e) => {
		e.preventDefault();
		if (!value.trim()) return;

		const tempMessage = {
			senderId: userId,
			receiverId: contactId,
			content: value,
			hour: new Date().toLocaleTimeString(["es-AR"], {
				hour: "2-digit",
				minute: "2-digit",
			})
		}
		// Actualizar frontend
		addLastMessage(contactId, {
			text: value,
			hour: new Date().toLocaleTimeString(['es-AR'], {
				hour: "2-digit",
				minute: "2-digit"
			})
		});

		;

		// 🔥 UI instantánea
		setMessages(prev => [...prev, tempMessage]);

		// 🔥 Guardar en backend
		await fetch("http://localhost:8080/api/chat/message", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				senderId: userId,
				receiverId: contactId,
				content: value
			}),
		});

		setValue("");
	};

	return (
		<div className="chat-screen">
			{/* ------- NAV ------- */}
			<div className="contact-nav">
				<div className="contact-nav__avatar-name">
					<img className="contact-nav__avatar" src={contact.avatar} alt="" />
					<h3 className="contact-nav__name">{contact.name}</h3>
				</div>
			</div>

			{/* ------- CHAT ------- */}
			<div className="chat">
				<ul className="chat-list">
					{messages.map((msg, index) => (
						<li
							key={index}
							className={`message ${msg.senderId === userId ? "message__me" : "message__other"
								}`}
						>
							{msg.content} {msg.hour}
						</li>
					))}
				</ul>

				{/* ------- INPUT ------- */}
				<div className="send-message">
					<form className="send-message__form" onSubmit={sendMessage}>
						<input
							className="send-message__input"
							type="text"
							value={value}
							onChange={(e) => setValue(e.target.value)}
							placeholder="Escribe un mensaje"
						/>
						<button className="send-message__send-btn" type="submit">
							Enviar
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ChatScreen;
