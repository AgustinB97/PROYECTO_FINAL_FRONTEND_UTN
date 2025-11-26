import ENVIRONMENT from "../config/enviroment";

export async function getUserChats(userId) {
    const res = await fetch(ENVIRONMENT.URL_API+`/api/chat/user/${userId}`);
    return await res.json();
}

export async function createPrivateChat(userAId, userBId) {
    const res = await fetch(ENVIRONMENT.URL_API+`/api/chat/private`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAId, userBId })
    });
    return await res.json();
}

export async function getMessages(chatId) {
    const res = await fetch(ENVIRONMENT.URL_API+`/api/chat/${chatId}/messages`);
    return await res.json();
}

export async function sendMessage(senderId, chatId, content) {
    const res = await fetch(ENVIRONMENT.URL_API+`/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId, chatId, content })
    });
    return await res.json();
}
