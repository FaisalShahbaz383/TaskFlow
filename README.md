# TaskFlow — Dynamic Task Management Dashboard Platform

An interactive, full-stack task management dashboard engineered with the MERN stack (React.js, Node.js, Express.js, MongoDB). Features asynchronous CRUD mutations, dynamic task categorization, real-time analytics, and status tracking.

---

## 🌟 Overview

TaskFlow Dashboard provides a clean, visual platform for managing project tasks across their lifecycle. The application demonstrates microservice API integration, persistent database modeling, and responsive frontend state management.

### ✨ Key Features
- **Full CRUD Operations:** Support for creating, reading, updating status/priority, and deleting task items.
- **Asynchronous Data Layer:** All user mutations communicate asynchronously via `async/await` fetch requests to an Express REST API.
- **Real-Time Analytics:** Interactive widget panel displaying total task count, pending/in-progress/completed breakdowns, and completion rates.
- **Dynamic Views:** Switch between Board (Kanban) layout and tabular data view with instant search and priority filters.
- **Database Persistence:** Mongoose schema integration backed by an active MongoDB instance.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Modern CSS (Flexbox / CSS Grid)
- **Backend Microservice:** Node.js, Express.js REST API
- **Database:** MongoDB, Mongoose ORM
- **API Protocol:** Asynchronous `async/await` Fetch API / JSON
- **Version Control:** Git & GitHub

---

## 🚀 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/tasks` | Retrieve all active tasks |
| `POST` | `/api/tasks` | Create a new task entry |
| `PUT` | `/api/tasks/:id` | Update task details or status |
| `DELETE` | `/api/tasks/:id` | Delete a task from database |

---
