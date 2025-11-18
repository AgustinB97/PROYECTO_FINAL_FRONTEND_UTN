import LoginScreen from './Screens/LoginScreen/LoginScreen'
import RegisterScreen from './Screens/RegisterScreen/RegisterScreen'
import AuthMiddleware from './Middleware/AuthMiddleware'
import InTheSamePage from './components/ScreensWPP/InTheSamePage'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatScreen from "./components/ScreensWPP/ChatScreen";
import React, { useEffect, useState } from "react";
import './App.css';

function App() {
  const [contactList, setContactList] = useState([]);
  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch("http://localhost:8080/api/users");
        const data = await res.json();

        if (data.ok) {
          setContactList(
            data.users.map(user => ({
              id: user._id,
              name: user.name,
              avatar: user.avatar || "default.png",
              chat: []                 // 🔥 el chat se carga más adelante del backend
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }

    fetchContacts();
  }, []);

  const addMessage = (id, message) => {
    setContactList(prev => {

      const foundContact = prev.find(contact => contact.id === id);
      if (!foundContact) return prev;

      const updateContact = {
        ...foundContact,
        chat: [...foundContact.chat, message]
      };

      const otherContact = prev.filter(contact => contact.id !== id)

      return (
        [updateContact, ...otherContact]
      )
    })


  }
  const deleteMessage = (contactId, messageIndex) => {
    setContactList(prev =>
      prev.map(contact => {
        if (contact.id === contactId) {
          return {
            ...contact,
            chat: contact.chat.filter((_, i) => i !== messageIndex)
          };
        } else {
          return contact;
        }
      })
    );
  };
  const addLastMessage = (contactId, lastMsg) => {
    setContactList(prev =>
      prev.map(c =>
        c.id === contactId
          ? { ...c, lastMessage: lastMsg }
          : c
      )
    );
  };


  return (
    <div>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path='/login' element={<LoginScreen />} />
        <Route path='/register' element={<RegisterScreen />} />
        <Route element={<AuthMiddleware />}>
          <Route
            path="/home"
            element={
              <InTheSamePage
                contactList={contactList}
                addMessage={addMessage}
                deleteMessage={deleteMessage}
                addLastMessage={addLastMessage}
              />
            }
          >
            <Route
              index
              element={
                <div className="chatscreen-start">
                  <img src="./start.png" alt="" />
                </div>
              }
            />
            <Route path="chat/:id" element={<ChatScreen />} />
          </Route>
        </Route>
      </Routes>
    </div >
  )
}

export default App


