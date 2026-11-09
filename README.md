# Akun Eventos

**Una plataforma, múltiples organizadores, infinitos destinos.**

## Descripción

Akun Eventos es una plataforma web orientada a la publicación, administración y gestión de eventos, diseñada para permitir que múltiples organizadores puedan gestionar sus propias actividades desde un mismo sistema.

El nombre *Akun* está inspirado en el término mapuche que, según la investigación realizada para el proyecto, significa «llegar».

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
- **dotenv:** gestión de variables de entorno.
- **Node.js Test Runner:** ejecución de pruebas automatizadas.

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
cd plataforma-eventos
```

Instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` en la raíz del proyecto, tomando como referencia `.env.example`.

### Variables de entorno

El proyecto utiliza variables de entorno para configurar el servidor y la conexión a MongoDB Atlas.

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`.

```env
PORT=3000
NODE_ENV=development
MONGO_URL=
JWT_SECRET=
```

- **PORT:** puerto en el que se ejecuta el servidor.
- **NODE_ENV:** entorno de ejecución de la aplicación.
- **MONGO_URL:** cadena de conexión a MongoDB Atlas, incluyendo el nombre de la base de datos.
- **JWT_SECRET:** variable reservada para la futura implementación de autenticación mediante JWT.

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

## Endpoints disponibles

Actualmente, la API cuenta con los siguientes endpoints:

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/health` | Verifica el estado del servidor. |
| GET | `/api/events` | Consulta inicial de eventos. |
| GET | `/api/sessions` | Ruta inicial del recurso de sesiones. |

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

## Estructura del proyecto

```text
plataforma-eventos/
│
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── config/
│   │   ├── database.config.js
│   │   └── env.config.js
│   │
│   ├── controllers/
│   │   ├── health.controller.js
│   │   ├── events.controller.js
│   │   └── sessions.controller.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── Inscription.js
│   │
│   ├── routes/
│   │   ├── health.router.js
│   │   ├── events.router.js
│   │   └── sessions.router.js
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
│   └── utils/
│
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
- **Config:** configuración general de la aplicación.

## Autor

Proyecto desarrollado por **Julian Jara Aguirre**.

---