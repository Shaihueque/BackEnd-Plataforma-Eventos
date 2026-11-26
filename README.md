# Akun Eventos

**Una plataforma, múltiples organizadores, infinitos destinos.**

## Descripción

Akun Eventos es una plataforma web orientada a la publicación, administración y gestión de eventos, diseñada para permitir que múltiples organizadores puedan gestionar sus propias actividades desde un mismo sistema.

El nombre **Akun** está inspirado en el término mapuche que, según la investigación realizada para el proyecto, significa «llegar».

Este significado representa la esencia de la plataforma: conectar a las personas con aquellos eventos a los que desean llegar, vivir experiencias significativas y formar parte de momentos especiales.

A diferencia de las plataformas tradicionales administradas por un único organizador, Akun Eventos propone un entorno multi-organizador en el que diferentes usuarios puedan registrarse, crear sus perfiles y administrar sus propios eventos de manera independiente.

## Filosofía del proyecto

Creemos que detrás de cada evento existe una experiencia que alguien espera vivir.

Puede ser un recital, una conferencia, una celebración, un encuentro deportivo o cualquier actividad que reúna personas alrededor de un interés compartido.

Akun Eventos nace con la idea de facilitar ese encuentro: que los organizadores puedan compartir sus propuestas y que las personas puedan encontrar y llegar a esos eventos que tanto desean.

**Akun: llegar. Llegar a una experiencia, a un encuentro, a un momento especial.**

## Tecnologías utilizadas

- **Node.js:** entorno de ejecución de JavaScript.
- **Express.js:** framework para el desarrollo de la API REST.
- **JavaScript (ES Modules):** sistema de módulos utilizado en el proyecto.
- **MongoDB Atlas:** base de datos MongoDB alojada en la nube.
- **Mongoose:** ODM utilizado para definir modelos y realizar operaciones con MongoDB.
- **bcrypt:** biblioteca utilizada para generar hashes seguros de las contraseñas de los usuarios.
- **jsonwebtoken:** biblioteca utilizada para generar y verificar tokens JWT.
- **cookie-parser:** middleware para interpretar cookies de las solicitudes HTTP.
- **dotenv:** gestión de variables de entorno.
- **CORS:** middleware para configurar el acceso desde otros orígenes.

## Estructura del proyecto

```text
plataforma-eventos/
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── config/
│   │   ├── cookie.config.js
│   │   ├── database.config.js
│   │   └── env.config.js
│   │
│   ├── controllers/
│   │   ├── health.controller.js
│   │   ├── events.controller.js
│   │   ├── sessions.controller.js
│   │   └── inscriptions.controller.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── Inscription.js
│   │
│   ├── routes/
│   │   ├── health.router.js
│   │   ├── events.router.js
│   │   ├── sessions.router.js
│   │   └── inscriptions.router.js
│   │
│   ├── services/
│   │   ├── users.service.js
│   │   ├── events.service.js
│   │   └── inscriptions.service.js
│   │
│   ├── repositories/
│   │   ├── users.repository.js
│   │   ├── events.repository.js
│   │   └── inscriptions.repository.js
│   │
│   ├── dao/
│   │   ├── users.dao.js
│   │   ├── events.dao.js
│   │   └── inscriptions.dao.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   └── notFound.middleware.js
│   │
│   ├── utils/
│   │   ├── AppError.js
│   │   ├── jwt.js
│   │   ├── password.utils.js
│   │   └── transaction.utils.js
│   │
│   └── validations/
│       ├── users.validation.js
│       └── inscriptions.validation.js
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Arquitectura

El proyecto utiliza una estructura modular que separa las responsabilidades de la aplicación:

- **Routes:** definición de los endpoints y asociación con sus controladores.
- **Controllers:** recepción de solicitudes y generación de respuestas HTTP.
- **Services:** capa destinada a la lógica de negocio.
- **Repositories:** abstracción del acceso a los datos.
- **DAO:** operaciones de acceso a la base de datos.
- **Models:** definición de las entidades principales del sistema.
- **Middlewares:** procesamiento y validación de solicitudes.
- **Config:** configuración general de la aplicación, conexión a MongoDB y cookies de autenticación.
- **Validations:** validación y normalización de los datos recibidos.
- **Utils:** funciones reutilizables para contraseñas, JWT, errores personalizados y transacciones de MongoDB.

## Endpoints disponibles

Actualmente, la API cuenta con los siguientes endpoints:

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/health` | Verifica el estado del servidor. |
| GET | `/api/events` | Consulta inicial de eventos. |
| GET | `/api/sessions` | Ruta inicial del recurso de sesiones. |
| POST | `/api/sessions/register` | Registra un nuevo usuario con validación de datos y contraseña protegida mediante bcrypt. |
| POST | `/api/sessions/login` | Inicia sesión y establece la cookie JWT. |
| GET | `/api/sessions/current` | Consulta el usuario autenticado mediante una cookie JWT válida. |
| POST | `/api/sessions/logout` | Cierra la sesión y elimina la cookie del cliente. |
| GET | `/api/inscriptions` | Consulta todas las inscripciones. |
| GET | `/api/inscriptions/:id` | Consulta una inscripción por su identificador. |
| POST | `/api/inscriptions` | Crea o reactiva una inscripción. |
| PATCH | `/api/inscriptions/:id/cancel` | Cancela una inscripción y libera sus entradas. |

### Ejemplos de respuestas

**GET `/api/health`**

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

**GET `/api/events`**

```json
{
  "status": "success",
  "message": "Eventos obtenidos correctamente",
  "payload": []
}
```

**GET `/api/sessions`**

```json
{
  "status": "success",
  "message": "Ruta de sesiones preparada"
}
```

### Registro seguro de usuarios

La plataforma permite registrar nuevos usuarios mediante un endpoint público que valida los datos recibidos, protege las contraseñas y almacena la información en MongoDB Atlas.

**Endpoint:**

`POST /api/sessions/register`

#### Datos requeridos

La solicitud debe enviarse utilizando el formato JSON.

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

**Campos obligatorios:**

- `first_name`: nombre del usuario.
- `last_name`: apellido del usuario.
- `email`: correo electrónico del usuario.
- `password`: contraseña con un mínimo de 8 caracteres.

**Formato de los campos:**

El endpoint `POST /api/sessions/register` recibe los campos `first_name` y `last_name` utilizando la convención **snake_case**.

Internamente, el modelo `User` de Mongoose utiliza `firstName` y `lastName`, siguiendo la convención **camelCase**.

La conversión se realiza en `src/validations/users.validation.js`, utilizado por la capa de servicios antes de guardar el usuario en MongoDB.

Por lo tanto, las solicitudes enviadas desde Postman u otro cliente deben utilizar `first_name` y `last_name`, tal como se muestra en el ejemplo anterior.

#### Validaciones implementadas

El registro de usuarios incluye las siguientes validaciones:

- Comprobación de los campos obligatorios.
- Validación del formato del correo electrónico.
- Normalización del email mediante eliminación de espacios exteriores y conversión a minúsculas.
- Validación de una contraseña de al menos 8 caracteres.
- Verificación de correos electrónicos previamente registrados.
- Prevención de duplicados mediante un índice único en MongoDB.
- Asignación automática del rol `user`, sin permitir que el cliente establezca roles privilegiados.

#### Seguridad de las contraseñas

Las contraseñas se procesan utilizando la biblioteca `bcrypt` antes de almacenarse en MongoDB.

El proceso de registro genera un hash de la contraseña mediante una función reutilizable ubicada en `src/utils/password.utils.js`.

La contraseña original nunca se almacena directamente en la base de datos mediante el endpoint de registro.

Además, la respuesta del endpoint excluye tanto la contraseña original como su hash.

#### Respuesta exitosa

Cuando el registro se realiza correctamente, el servidor responde con el código HTTP `201 Created`.

```json
{
  "status": "success",
  "payload": {
    "id": "IDENTIFICADOR_GENERADO_POR_MONGODB",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

#### Manejo de errores

El endpoint utiliza un middleware global para gestionar los errores y devolver respuestas HTTP consistentes.

| Código HTTP | Situación | Mensaje |
|---|---|---|
| 400 | Faltan campos obligatorios | Faltan campos obligatorios |
| 400 | Formato de email incorrecto | El formato del correo electrónico no es válido |
| 400 | Contraseña demasiado corta | La contraseña debe tener al menos 8 caracteres |
| 409 | Email previamente registrado | El email ya está registrado |
| 500 | Error interno del servidor | Mensaje genérico de error interno |

**Ejemplo de respuesta con error:**

```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

#### Arquitectura del registro

El registro respeta la arquitectura por capas utilizada en el proyecto:

1. **Ruta:** recibe la solicitud `POST /api/sessions/register`.
2. **Controlador:** obtiene los datos y genera la respuesta HTTP.
3. **Servicio:** delega las validaciones y la normalización en `users.validation.js`, genera el hash y aplica las reglas de negocio.
4. **Repositorio:** abstrae las operaciones de acceso a los datos.
5. **DAO:** ejecuta las operaciones mediante Mongoose.
6. **Modelo:** define la estructura y las restricciones de los usuarios en MongoDB.

#### Pruebas realizadas con Postman

Se realizaron pruebas manuales para verificar el funcionamiento del endpoint:

| Prueba | Resultado |
|---|---|
| Registro con datos válidos | 201 Created |
| Registro con campos faltantes | 400 Bad Request |
| Registro con email inválido | 400 Bad Request |
| Registro con contraseña de menos de 8 caracteres | 400 Bad Request |
| Registro con email duplicado | 409 Conflict |
| Intento de asignar el rol `admin` | 201 Created, con rol `user` |

También se verificó que la respuesta exitosa no exponga la contraseña del usuario.

La persistencia de los datos se realiza en MongoDB Atlas y las contraseñas generadas mediante el endpoint de registro se almacenan utilizando hashes de bcrypt.

## Autenticación de usuarios con JWT

La plataforma incorpora autenticación mediante JSON Web Tokens (JWT). El inicio de sesión verifica las credenciales del usuario registrado y, si son correctas, genera un token firmado que contiene únicamente `id`, `email` y `role`. El token se envía en la cookie `currentUser`, configurada como `httpOnly`, `sameSite: lax`, con `path: /`, una expiración sincronizada con la del JWT (una hora por defecto) y con `secure` habilitado en producción. La configuración se centraliza en `src/config/cookie.config.js`. Los tokens se firman y verifican mediante HS256.

### Configuración de autenticación

Además de las variables de entorno ya documentadas, la autenticación utiliza:

```env
JWT_SECRET=REEMPLAZAR_POR_UNA_CLAVE_SEGURA
JWT_EXPIRES_IN=1h
```

`JWT_SECRET` es obligatorio para firmar y verificar tokens. `JWT_EXPIRES_IN` configura la duración del JWT y tiene el valor predeterminado `1h`. El archivo `.env` debe mantenerse fuera del repositorio.

### Endpoints de autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/sessions/login` | Verifica las credenciales y establece la cookie JWT. |
| GET | `/api/sessions/current` | Devuelve los datos del usuario autenticado; requiere una cookie JWT válida. |
| POST | `/api/sessions/logout` | Ordena al cliente eliminar la cookie de autenticación. |

#### Iniciar sesión

**`POST /api/sessions/login`**

Ejemplo de solicitud JSON:

```json
{
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

Respuesta exitosa (`200 OK`):

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

La respuesta incluye una cabecera `Set-Cookie` para `currentUser`. Si el correo no existe o la contraseña es incorrecta, el servidor responde `401 Unauthorized` con el mismo mensaje genérico:

```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

#### Consultar el usuario autenticado

**`GET /api/sessions/current`**

El cliente debe enviar la cookie `currentUser` recibida en el inicio de sesión. Ejemplo de respuesta exitosa (`200 OK`):

```json
{
  "status": "success",
  "payload": {
    "id": "IDENTIFICADOR_DEL_USUARIO",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

La respuesta no incluye la contraseña ni su hash. Si la cookie falta, el token es inválido o ha expirado, responde `401 Unauthorized`:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

#### Cerrar sesión

**`POST /api/sessions/logout`**

Respuesta exitosa (`200 OK`):

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

El servidor envía una instrucción para borrar la cookie `currentUser` del cliente. Esto **no revoca por sí solo** un JWT que ya se haya copiado: el token sigue siendo criptográficamente válido hasta su vencimiento, salvo que se implemente un mecanismo adicional de revocación.

El middleware de autenticación verifica la cookie y asigna los datos del token a `req.user`. La utilidad JWT centraliza la firma y verificación de tokens. El manejador global de errores registra las trazas de los errores HTTP `500` y superiores, evitando registros extensos para errores controlados como `401`.

## Gestión de inscripciones

El módulo permite consultar, crear, reactivar y cancelar inscripciones a eventos publicados.

- Cada usuario puede tener una única inscripción por evento.
- La cantidad de entradas por inscripción debe ser un número entero entre 1 y 4.
- Las inscripciones pendientes reservan entradas desde su creación.
- La cancelación libera las entradas reservadas.
- Una inscripción cancelada puede reactivarse reutilizando el registro existente.
- La reserva de entradas utiliza operaciones atómicas y las operaciones de inscripción se ejecutan mediante transacciones de MongoDB, centralizadas en `src/utils/transaction.utils.js`.
- Las validaciones de entrada se encuentran en `src/validations/inscriptions.validation.js`.

Actualmente, las rutas de eventos e inscripciones no cuentan con autorización por roles. La ruta `/api/sessions/current` requiere autenticación.

## Manejo centralizado de errores

La clase `AppError` permite generar errores personalizados con su código HTTP. El middleware `notFound` deriva las rutas inexistentes al manejador global `errorHandler`, que construye las respuestas de error.

El manejador contempla errores de validación y conversión de Mongoose, registros duplicados y solicitudes con JSON mal formado. Los errores internos del servidor se registran en la terminal y devuelven un mensaje genérico al cliente.

## Requisitos previos

Para ejecutar el proyecto necesitás tener instalado:

- Node.js
- npm
- Git

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/Shaihueque/BackEnd-Plataforma-Eventos.git
```

Ingresar al directorio:

```bash
cd BackEnd-Plataforma-Eventos
```

Instalar las dependencias:

```bash
npm install
```

## Variables de entorno

El proyecto utiliza variables de entorno para configurar el servidor y la conexión a MongoDB Atlas.

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`.

```env
PORT=3000
NODE_ENV=development
MONGO_URL=
JWT_SECRET=
JWT_EXPIRES_IN=1h
```

- **PORT:** puerto en el que se ejecuta el servidor.
- **NODE_ENV:** entorno de ejecución de la aplicación.
- **MONGO_URL:** cadena de conexión a MongoDB Atlas, incluyendo el nombre de la base de datos.
- **JWT_SECRET:** clave secreta utilizada para firmar y verificar los JWT.
- **JWT_EXPIRES_IN:** duración de los tokens JWT (por defecto, `1h`).

## Ejecución

Iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

Iniciar el servidor:

```bash
npm start
```

Por defecto, la aplicación utiliza el puerto `3000`.

## Verificación funcional con Postman

Se realizaron verificaciones manuales de los endpoints existentes durante el desarrollo y las correcciones de la Pre-entrega 3.

| Operación | Código HTTP esperado |
|---|---|
| Estado del servidor | 200 OK |
| Registro válido | 201 Created |
| Inicio de sesión y consulta del usuario autenticado | 200 OK |
| Consulta de eventos e inscripciones | 200 OK |
| Cierre de sesión | 200 OK |
| Acceso a `/current` sin autenticación | 401 Unauthorized |
| Solicitud con JSON mal formado | 400 Bad Request |
| Ruta inexistente | 404 Not Found |
| Registro con correo duplicado | 409 Conflict |

También se realizaron comprobaciones manuales de creación, cancelación y reactivación de inscripciones, así como del control de capacidad y la reserva y liberación de entradas.

## Autor

Proyecto desarrollado por **Julian Jara Aguirre**.