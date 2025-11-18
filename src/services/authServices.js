import ENVIRONMENT from "../config/enviroment.js";

export async function register(name, email, password, avatar) {
    try {
        const body = {
            name: name,
            email: email,
            password: password,
            avatar: avatar
        };

        const response_http = await fetch(
            ENVIRONMENT.URL_API + "/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        const response = await response_http.json();
        return response;
    } catch (error) {
        console.error("Error al registrar:", error);
        throw new Error("Error interno del servidor");
    }
}


export async function login(email, password) {
    try {
        const body = { email, password };

        const response_http = await fetch(
            ENVIRONMENT.URL_API + "/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        const response = await response_http.json();

        // 👉 SOLO se guarda auth_token (tu backend no devuelve user)
        if (response.ok && response.body?.auth_token) {
            localStorage.setItem("auth_token", response.body.auth_token);
        }

        return response;
    } catch (error) {
        console.error("Error al loguear:", error);
        throw new Error("Error interno del servidor");
    }
}
