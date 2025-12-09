import LoginScreen from './Screens/LoginScreen/LoginScreen'
import RegisterScreen from './Screens/RegisterScreen/RegisterScreen'
import AuthMiddleware from './Middleware/AuthMiddleware'
import InTheSamePage from './components/ScreensWPP/InTheSamePage'
import ChatScreen from "./components/ScreensWPP/ChatScreen";
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "./Context/AuthContext";
import { SocketProvider } from "./Context/SocketContext";
import { ChatProvider } from "./Context/ChatContext";
import ConfigScreen from './components/ScreensWPP/ConfigScreen';
import StartChatScreen from './components/ScreensWPP/StartChatScreen';


function App() {

  return (
    <AuthContextProvider>
      <SocketProvider>
        <ChatProvider>
          <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />

            <Route element={<AuthMiddleware />}>
              <Route path="/home" element={
                <InTheSamePage />
              }>
                <Route
                  index
                  element={
                    <div className="chatscreen-start">
                      <img src="" alt="" />
                    </div>
                  }
                />
                <Route path='start-chat' element={<StartChatScreen />} />
                <Route path="chat/:id" element={<ChatScreen />} />
                <Route path="settings" element={<ConfigScreen />} />
              </Route>
            </Route>
          </Routes>
        </ChatProvider>
      </SocketProvider >
    </AuthContextProvider >

  );
}

export default App;