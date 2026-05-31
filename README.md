# Authentication System

A secure authentication backend built with **Node.js**, **Express.js**, and **MongoDB**, featuring user registration, login, JWT-based authentication, session management, email verification, refresh tokens, and logout functionality.

---

## Features

- User Registration
- User Login
- JWT Authentication
- Refresh Token Mechanism
- Email Verification
- Session Management
- Get Current User Profile
- Logout Current Session
- Logout All Sessions
- MongoDB Integration
- Environment Variable Configuration

---

## Project Structure

```text
AUTHSYSTEM
│
├── src
│   ├── config
│   │   ├── config.js
│   │   └── database.js
│   │
│   ├── controllers
│   │   └── auth.controller.js
│   │
│   ├── models
│   │   ├── otp.model.js
│   │   ├── session.model.js
│   │   └── user.model.js
│   │
│   ├── routes
│   │   └── auth.routes.js
│   │
│   ├── services
│   │   └── email.service.js
│   │
│   ├── utils
│   │   └── utils.js
│   │
│   └── app.js
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Tokens)
- Nodemailer
- dotenv

---

## Installation

### Clone Repository

```bash
git clone https://github.com/palaksharma1011/Advanced-authentication-system.git
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory.

### Run Server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

---

## API Endpoints

Base URL

```http
/api/auth
```

### Register User

```http
POST /register
```

Creates a new user account.

Example Request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

---

### Login User

```http
POST /login
```

Authenticates a user and returns tokens.

Example Request:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

### Get Current User

```http
GET /get-me
```

Returns authenticated user information.

Requires Authorization Header:

```http
Authorization: Bearer <access_token>
```

---

### Refresh Token

```http
GET /refresh-token
```

Generates a new access token using a valid refresh token.

---

### Verify Email

```http
GET /verify-email
```

Verifies a user's email address.

---

### Logout

```http
GET /logout
```

Logs out the current session.

---

### Logout All Sessions

```http
GET /logout-all
```

Logs out the user from all active sessions.

---

## Environment Variables

The following environment variables are required:

```env
PORT=
MONGO_URL=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_USER=
```

---

# Testing

API testing was performed using:

- Postman
- Thunder Client (Optional)

---

# Security Notes

- Passwords are securely hashed before storage.
- JWT authentication is used for protected routes.
- Refresh token mechanism implemented.
- Sensitive credentials are stored in environment variables.
- `.env` is excluded from Git tracking.

---

# Future Improvements

- Password Reset via Email
- Rate Limiting
- OAuth Authentication (Google/GitHub)
- Role-Based Access Control (RBAC)
- Docker Support
- API Documentation using Swagger

---

# Author

Palak

GitHub: https://github.com/palaksharma1011
