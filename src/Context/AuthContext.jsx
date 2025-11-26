import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { decodeToken } from "react-jwt";

export const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {

    const navigate = useNavigate()

    const [user, setUser] = useState(null)
    const [isLogged, setIsLogged] = useState(
        Boolean(localStorage.getItem('auth_token'))
    )

    useEffect(() => {
        const token = localStorage.getItem("auth_token");

        if (!token) {
            setIsLogged(false);
            setUser(null);
            return;
        }

        const user_session = decodeToken(token);

        if (!user_session) {
            setIsLogged(false);
            setUser(null);
            return;
        }

        setIsLogged(true);
        setUser(user_session);
    }, []);


    function onLogout() {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        setIsLogged(false)
        setUser(null)
        navigate('/login')
    }

    function onLogin(auth_token, userData) {
        localStorage.setItem('auth_token', auth_token)
        localStorage.setItem('user', JSON.stringify(userData))

        setIsLogged(true)
        setUser(userData)

        navigate('/home')
    }

    return (
        <AuthContext.Provider value={{ isLogged, user, setUser, onLogin, onLogout }}>
            {children}
        </AuthContext.Provider>
    )
}


