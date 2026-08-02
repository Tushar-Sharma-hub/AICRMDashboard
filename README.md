# AICRM

AICRM is a full-stack AI-enhanced CRM application built as a modern SaaS sales productivity tool. It combines a React + Vite frontend with an Express + MongoDB backend, plus AI-powered lead summaries, email drafting, and sales insights using Google Gemini.

## What this project does

AICRM helps sales teams manage leads, contacts, tasks, notes, and pipeline activity in one place. Key capabilities include:

- User authentication with email/password and JWT session support
- Lead management with CRUD operations, filters, search, and bulk actions
- Contact management and note tracking for customer records
- Task tracking with open/completed status
- Visual pipeline board with drag-and-drop lead stages
- Dashboard analytics for revenue, conversion, lead activity, and pipeline health
- AI features for lead summaries, sales insights, and email draft generation
- Secure backend APIs with role-aware request handling and centralized error handling

## Project structure

- `backend/`: Express API server, MongoDB models, authentication, AI controller, analytics controller, and route definitions
- `frontend/AICRMDashboard/`: React app built with Vite, Tailwind-style UI components, routes, and page screens for dashboard, leads, contacts, pipeline, tasks, notes, and settings

## Technology stack

- Frontend:
  - React 19
  - Vite
  - React Router DOM
  - Tailwind CSS / utility-first styling
  - dnd-kit for drag-and-drop pipeline
  - Recharts for charts and analytics
  - Axios for API requests
  - React Hook Form for form handling
  - Sonner for toast notifications

- Backend:
  - Node.js + Express
  - MongoDB + Mongoose
  - JWT authentication
  - bcrypt for password hashing
  - dotenv for environment management
  - Morgan logging
  - Google Gemini AI integration via `@google/genai`

## Local setup

### Backend

1. `cd backend`
2. `npm install`
3. Create a `.env` file with keys like:
   - `MONGO_URI`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (optional, defaults to `gemini-2.5-flash`)
   - `CLIENT_URL` (optional, default `http://localhost:5173`)
4. `npm run dev`

### Frontend

1. `cd frontend/AICRMDashboard`
2. `npm install`
3. `npm run dev`

## Notes

- The backend exposes authenticated routes under `/api/*`.
- AI routes require valid Gemini configuration and API access.
- The frontend uses `/login` and `/register` for authentication, with protected app pages behind an authenticated layout.

## Useful commands

- Backend: `npm run dev` (hot reload with nodemon)
- Frontend: `npm run dev` (Vite development server)
- Frontend build: `npm run build`

---

AICRM is a polished example of a modern CRM application combining sales workflow features with AI-assisted intelligence and analytics.