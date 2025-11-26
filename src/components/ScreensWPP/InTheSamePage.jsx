import { Outlet } from 'react-router-dom';
import ContactScreen from "../ScreensWPP/ContactScreen";
import React from 'react';

const InTheSamePage = () => {
    return (
        <div className='handle-screens'>
            <div className='contacScreen-container'>
                <ContactScreen />
            </div>

            <div className='outlet-container'>
                <Outlet />
            </div>
        </div>
    );
}

export default InTheSamePage;
