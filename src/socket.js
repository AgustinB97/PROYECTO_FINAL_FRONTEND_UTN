import { io } from "socket.io-client";

export const socket = io("https://proyecto-final-backend-utn-three.vercel.app", {
    withCredentials: true
});
