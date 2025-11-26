import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import ENVIRONMENT from "../config/enviroment";


export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const s = io(ENVIRONMENT.URL_API, {
            withCredentials: true
        });

        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
