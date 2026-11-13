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
- **bcrypt:** biblioteca utilizada para generar hashes seguros de las contraseñas de los usuarios.
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
| POST | `/api/sessions/register` | Registra un nuevo usuario con validación de datos y contraseña protegida mediante bcrypt. |

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
3. **Servicio:** realiza las validaciones, genera el hash y aplica las reglas de negocio.
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