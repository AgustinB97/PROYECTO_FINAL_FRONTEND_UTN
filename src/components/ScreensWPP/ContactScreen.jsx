import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ContactScreen = ({ contactList }) => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const [selectContactId, setSelectContactId] = useState(null);

    const filteredContacts = contactList.filter((contact) =>
        contact.name.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="contact-screen">
            <div className="container__logo-newchat-menu">
                <svg viewBox="0 0 104 28" height="28" width="104" preserveAspectRatio="xMidYMid meet" className="container__whats-app-logo" fill="none">
                    {/* ICONO WHATSAPP (lo dejo tal como lo tenías) */}
                    <path d="m13.07 21.343-2.681-10.767h-.045L7.708 21.343H4.186L0 5.523h2.981L5.84 17.621h.05L8.973 5.523h2.828l2.997 12.098h.019L17.86 5.523h2.915l-4.252 15.82h-3.456z" fill="currentColor"></path>
                </svg>

                <div className="container__newchat-menu">
                    <button className="container__new-chat">
                        <svg viewBox="0 0 24 24" height="24" width="24" fill="none">
                            <path fill="currentColor"></path>
                        </svg>
                    </button>

                    <button className="container__menu">
                        <svg viewBox="0 0 24 24" height="24" width="24" fill="none">
                            <path fill="currentColor"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <form className="search-contact">
                <input
                    type="text"
                    placeholder="Buscar un chat o iniciar uno nuevo"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </form>

            <ul className="contacts-list">
                {filteredContacts.map((contact) => {
                    const last = contact.lastMessage; // 🔥 AHORA VIENE DE BACKEND

                    return (
                        <li
                            className="contact-preview"
                            key={contact.id}
                            onClick={() => {
                                navigate(`chat/${contact.id}`);
                                setSelectContactId(contact.id);
                            }}
                            style={{
                                backgroundColor:
                                    selectContactId === contact.id ? "#ebe6e6ff" : undefined,
                            }}
                        >
                            <div className="contact-preview__avatar-container">
                                <img
                                    className="contact-preview__avatar"
                                    src={contact.avatar}
                                    alt={contact.name}
                                />
                            </div>

                            <div className="contact-preview__text">
                                <div className="contact-preview__name-hour">
                                    <h2 className="contact-preview__name">{contact.name}</h2>

                                    {/* HORA DEL ÚLTIMO MENSAJE */}
                                    <span className="contact-preview__hour">
                                        {last ? last.hour : ""}
                                    </span>
                                </div>

                                {/* ÚLTIMO MENSAJE */}
                                <span className="contact-preview__last-message">
                                    {last ? last.text : "No hay mensajes"}
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ContactScreen;
