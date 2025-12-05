WhatsAppProyect
Descripción

WhatsAppProyect es un sistema de mensajería instantánea que permite a los usuarios chatear de manera 1 a 1 o en grupos. El proyecto está pensado para brindar una experiencia similar a aplicaciones de mensajería modernas, con soporte para envío de mensajes de texto, imágenes y administración de grupos.

Tecnologías
Frontend

-React.js

-React Hooks (useState, useEffect, useNavigate)

-react-jwt para manejo de tokens

-socket.io-client para comunicación en tiempo real

Tecnologías
Backend

-Node.js + Express

-socket.io para mensajería en tiempo real

-cors para manejar cross-origin requests

-http.createServer para levantar el servidor

-multer y cloudinary para carga de imágenes

-MongoDB con mongoose para gestión de modelos y persistencia

-bcrypt para encriptar contraseñas

-jsonwebtoken para autenticación mediante tokens

-joi para validación de datos con schemas

-Middlewares personalizados para autenticación, manejo de errores y carga de imágenes

Funcionalidades

-Registro y login de usuarios con autenticación segura

-Chats privados y grupales

-Envío de mensajes de texto

-Manejo de imágenes a través de Cloudinary

-Administración de grupos: agregar y remover usuarios

-Obtención del último mensaje de cada chat

-Middleware de validación y manejo de errores personalizado

Estructura del proyecto
Backend

-controllers/ → controladores de la API

-services/ → lógica de negocio

-models/ → modelos de datos con Mongoose

-repositories/ → consultas a la base de datos

-routes/ → definición de endpoints

-middlewares/ → autenticación, validaciones y manejo de imágenes

-utils/ → errores personalizados

Frontend

-Componentes React para login, registro y pantalla de chat

-Contexts para autenticación (AuthContext), manejo de sockets (SocketContext) y manejo centralizado de informacion de la bd(ChatContext)

-Servicios para consumir la API del backend

Endpoints principales

/api/auth/login → login de usuario

/api/auth/register → registro de usuario

/api/chat/private → crear y obtener chats privados

/api/chat/group/create → crear chats grupales

/api/chat/:id → obtener información de un chat por ID

/api/chat/message → enviar y obtener mensajes

/api/chat/message/:id → eliminar mensajes

/api/chat/:id/add-user → agregar usuarios a un grupo

/api/chat/:id/remove-user → remover usuarios de un grupo

Instalación y ejecución
Backend

Clonar el repositorio

Instalar dependencias:

cd backend
npm install


Configurar variables de entorno (.env) con:

MONGO_URI=<tu_mongodb_uri>
JWT_SECRET=<tu_secreto>
CLOUDINARY_URL=<tu_cloudinary_url>
PORT=8080


Ejecutar el servidor:

npm run dev

Frontend

Instalar dependencias:

cd frontend
npm install


Configurar .env con la URL de tu backend:

REACT_APP_API_URL=https://tu-backend.vercel.app


Ejecutar la app:

npm start

------------------------------------------------------------------------------------------------------------------------------

Notas sobre deployment y problemas conocidos

Actualmente el login en producción no funciona correctamente, debido a problemas de CORS y manejo de cookies con socket.io.

Primeramente tuve problemas con el socket.io con el manejo on time de la informacion (si bien el back y la bd respondian bien y el chatscreen y la contactlist actualizaban al mandar un mensaje, al borrarlo o al crear nuevos grupos o chats estos no se cargaban en la contactlist hasta refrescar la pagina), al intentar fixear termine rompiendo todo al punto de no poder loguear siquiera. 

Las imágenes anteriormente se guardaban de manera local; ahora se cargan en Cloudinary, al cambiar a Cloudinary logre que no me tire fallos pero tampoco logre se guarden bien los avatares.

El proyecto requiere ajustes de CORS, cookies y conexión de sockets para que el login y el chat funcionen correctamente en producción.
