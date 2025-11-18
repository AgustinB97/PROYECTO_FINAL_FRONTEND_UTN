import { Outlet } from 'react-router-dom';
import ContactScreen from "../ScreensWPP/ContactScreen";
import React from 'react';

const InTheSamePage = ({ contactList, addMessage, deleteMessage }) => {
    return (
        <div className='handle-screens'>
            <div className='contacScreen-container'>
                <ContactScreen contactList={contactList} />
            </div>
            <div className='outlet-container'>
                <Outlet context={{contactList, addMessage, deleteMessage}} />
            </div>
        </div>
    );
}

export default InTheSamePage