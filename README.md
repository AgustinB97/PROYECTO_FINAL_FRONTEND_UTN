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

REACT_APP_API_URL=https://tu-backend.app


Ejecutar la app:

npm start

------------------------------------------------------------------------------------------------------------------------------

Notas sobre Deployment y Problemas Conocidos

Durante el desarrollo del proyecto surgieron varios desafíos técnicos, especialmente relacionados con tiempo real (WebSockets) y despliegue, que influyeron en el comportamiento final de la aplicación. A continuación se detallan los puntos más relevantes, junto con consideraciones para futuras mejoras.

Deployment

Inicialmente intenté desplegar la API en Vercel, pero descubrí que la plataforma no soporta WebSockets ni long polling, algo fundamental para Socket.IO.
Este punto generó bastante tiempo de investigación hasta identificar la causa.
Finalmente, el backend se migró correctamente a Railway, donde los sockets funcionan sin limitaciones.

Problemas Conocidos / Mejoras Pendientes

1. Manejo de grupos y sincronización visual

La aplicación es completamente funcional, pero aún tiene algunos detalles a pulir:

Al crear un grupo nuevo, la lista de chats no siempre refleja el cambio de inmediato; en algunos casos requiere un refresh manual (F5).

Sería ideal que los usuarios no administradores puedan abandonar el grupo desde la interfaz.

Estas mejoras implican ajustar la lógica de sincronización entre el backend y el frontend mediante Socket.IO.

2. Avatares en chats grupales

En algunos escenarios, los avatares de los miembros del grupo no cargan correctamente, especialmente despues del primer render

3. Eliminación de mensajes

La eliminación funciona correctamente, pero:

Desde la perspectiva del otro usuario, el mensaje borrado no desaparece en tiempo real.

Conclusión

A pesar de estos detalles, la aplicación es totalmente funcional. Durante el desarrollo se resolvieron desafíos importantes, se migró correctamente la api y se implementó mensajería en tiempo real, chats grupales, administración de usuarios y manejo de archivos (avatars).
