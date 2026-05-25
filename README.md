# node20-mysql-auth-api

Node.js 20 + Express + Prisma boilerplate API for authentication with MySQL.

## Features

- Email sign up
- Email verification
- Authentication (JWT access + refresh token)
- Forgot password + reset password
- Protected `me` endpoint
- Prisma schema for users, verification tokens, password reset tokens, and refresh tokens
- Layered project structure (`controllers`, `routes`, `middleware`, `services`, `repositories`, etc.)

## Tech Stack

- Node.js 20
- Express 5
- Prisma + MySQL
- Zod validation
- Nodemailer email abstraction
- Helmet, CORS, and rate limiting middleware

## Project Structure

```text
src/
  config/
  controllers/
  lib/
  middleware/
  repositories/
  routes/
  services/
  utils/
  validators/
prisma/
```

## Setup

1. Use Node 20:
   ```bash
   nvm use
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
4. Update `.env` values for MySQL, JWT secrets, app URL, and SMTP.

## Database (Prisma + MySQL)

- Generate Prisma client:
  ```bash
  npm run prisma:generate
  ```
- Push schema to database for local setup:
  ```bash
  npm run prisma:push
  ```
- Or create migrations during development:
  ```bash
  npm run prisma:migrate
  ```

## Run

- Development:
  ```bash
  npm run dev
  ```
- Production:
  ```bash
  npm start
  ```

## Auth Endpoints

Base path: `/api/auth`

- `POST /signup` – Register user and send verification email
- `GET /verify-email?token=...` – Verify email address
- `POST /login` – Login with email/password
- `POST /refresh-token` – Rotate refresh token and issue new JWT access token
- `POST /forgot-password` – Send password reset email
- `POST /reset-password` – Reset password with reset token
- `POST /logout` – Revoke refresh token
- `GET /me` – Authenticated user profile (Bearer token required)

## Environment Variables

See `.env.example` for all variables.

Required values include:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `APP_BASE_URL`
- `EMAIL_FROM`
- SMTP settings (`SMTP_HOST`, `SMTP_PORT`, optional auth)
