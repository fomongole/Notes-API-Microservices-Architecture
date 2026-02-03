# 🚀 The Notes App API (Microservices Architecture)

> A robust, enterprise-grade distributed system refactored from a monolithic architecture. This project demonstrates the **Database-per-Service** pattern, **Polyglot Persistence** (MongoDB + PostgreSQL), **API Gateway** implementation, and synchronous inter-service communication using Node.js, Express, and TypeScript.

---

## 🏗️ Architecture Overview

The application is split into three distinct domain services, unified by a single entry point (API Gateway). This system uses **Polyglot Persistence**, meaning different services use different database technologies best suited for their data needs.

| Service | Port | Responsibility | Database |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `8000` | Unified Entry Point, Request Routing, Rate Limiting | N/A |
| **Auth Service** | `3001` | Registration, Login, JWT Issuance, Security | `micro-auth-db` (MongoDB) |
| **User Service** | `3002` | User Profiles, Admin Management, Sync Logic | `micro-user-db` (MongoDB) |
| **Notes Service** | `3003` | Notes CRUD, Tagging, Full-text Search | **PostgreSQL** (via Prisma) |

---

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Language:** TypeScript
* **Framework:** Express.js
* **Databases:** * **MongoDB:** For flexible user profiles and auth logs (Auth & User Services).
    * **PostgreSQL:** For structured relational data and efficient indexing (Notes Service).
* **ORM/ODM:** * **Mongoose:** Used in Auth/User services.
    * **Prisma (v7+):** Used in Notes service with `pg` driver adapter for connection pooling.
* **Communication:** Synchronous HTTP (`axios`) for internal sync (e.g., Deactivation).
* **Gateway:** `http-proxy-middleware`.
* **Validation:** Zod.
* **Security:** Helmet, HPP, CORS, JWT.

---

## ⚙️ Key Features & Patterns

### 1. Polyglot Persistence
Demonstrates how to run a Hybrid Database system. The **Notes Service** was completely migrated to **PostgreSQL** to leverage relational arrays and indexing, while **Auth & User** services remain on **MongoDB**. The frontend/client remains unaware of these underlying differences.

### 2. Distributed Data Sync (The "Sync-Back" Pattern)
We handle data consistency between Auth and User services using internal API routes:
* **Soft Delete:** When a user deletes their own account, the User Service marks the profile as inactive and calls the Auth Service to disable login access immediately.
* **Hard Delete:** When an Admin deletes a user, the User Service destroys the profile and commands the Auth Service to permanently remove the credentials.

### 3. Stateless Authentication
The **Notes Service** verifies JWTs independently without needing to call the Auth Service database, ensuring horizontal scalability.

---

## 📡 API Endpoints (Via Gateway)

All requests are made to port `8000`.

### 🔐 Auth Service
* `POST /api/auth/register` - Register a new user (Syncs to User Service)
* `POST /api/auth/login` - Login & receive JWT
* `POST /api/auth/forgot-password` - Request password reset email
* `PATCH /api/auth/reset-password/:token` - Set new password using token
* `PATCH /api/auth/update-password` - Update password (requires login)

### 👤 User Service
**Current User**
* `GET /api/users/me` - Get current profile
* `PATCH /api/users/update-me` - Update bio, avatar, or username
* `DELETE /api/users/delete-me` - **Soft Delete** account (Syncs deactivation to Auth)

**Admin Operations**
* `GET /api/users` - Get all users
* `GET /api/users/:id` - Get specific user details
* `PATCH /api/users/:id` - Update a specific user
* `DELETE /api/users/:id` - **Hard Delete** user (Permanently removes from Auth DB)

### 📒 Notes Service (PostgreSQL)
* `GET /api/notes` - Get all notes (Supports pagination, search, & tag filtering)
* `POST /api/notes` - Create a new note
* `GET /api/notes/:id` - Get a single note
* `PATCH /api/notes/:id` - Update a note
* `DELETE /api/notes/:id` - Delete a note