# Pragati Design Studio - Web Application

A modern, dynamic web application for **Pragati Design Studio**, featuring a React frontend and a Node.js/Express backend. This application includes a public-facing portfolio, services showcase, and a comprehensive admin dashboard for content management.

## 🚀 Technology Stack

### Frontend
*   **React** (Vite)
*   **Tailwind CSS** (Styling)
*   **Shadcn/UI** (Components)
*   **React Query** (Data Fetching)

### Backend
*   **Node.js** & **Express**
*   **SQLite** (Development Database) / **MySQL** (Production Ready)
*   **Multer** (File Uploads)
*   **JWT** (Authentication)

## 🛠️ Setup & Installation

### 1. Prerequisites
*   Node.js (v18+)
*   npm

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Create environment file (.env) in root
VITE_API_URL=http://localhost:5000/api
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Start the backend server
npm run dev
# Server will start on http://localhost:5000
```

### 4. Running the Application
Open two terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🔑 Admin Access

Access the admin dashboard at `/admin/login`.

**Default Credentials:**
*   **Email:** `admin@pragati.com`
*   **Password:** `admin123`

## 📂 Project Structure

*   **/src** - Frontend source code (pages, components, context).
*   **/backend** - Backend server code.
    *   **/src/routes** - API endpoints.
    *   **/database** - SQLite database file.
    *   **/uploads** - User uploaded files.
*   **progmattic_mysql_schema.sql** - MySQL schema for production.

## ✨ Features

*   **Dynamic Content Management**: Admin can update Services, Projects, Testimonials, and Blog posts without code changes.
*   **Authentication**: Secure admin login with JWT.
*   **Image Uploads**: Drag-and-drop image uploads for all content types.
*   **Responsive Design**: Fully responsive layout for mobile and desktop.
*   **Contact Form**: Inquiries are saved to the database and viewable in the admin dashboard.

## 🗄️ Database

The project currently uses **SQLite** for ease of development.
To switch to **MySQL**:
1.  Use `backend/database/pragati_mysql_schema.sql` to import the schema.
2.  Update backend credentials in `.env` (refer to `backend/src/config/mysql-wrapper.ts`).

---
Developed for Pragati Design Studio.
