# GrowthStageSA - A Learnerships and Skills Development Portal

## Prerequisites

Before running the project locally, ensure the following are installed on your machine:

- Node.js
- npm (comes with Node.js)
- Git

---

## Clone the Repository

```bash
git clone https://github.com/Always-in-SYNNK/SD-Web-App.git
cd SD-Web-App
```

---

## Install Dependencies

### Backend

Navigate to the backend folder and install dependencies:

```bash
cd backend
npm install
```

### Frontend

Open a new terminal, navigate to the frontend folder, and install dependencies:

```bash
cd frontend
npm install
```

---

## Environment Variables

Example templates are provided at [backend/.env.example](backend/.env.example) and [frontend/.env.example](frontend/.env.example).
Copy the templates to `.env` and fill with your values before running the app:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Recommended keys (examples):

- Backend:

- Backend (examples used in `backend/.env.example`):
	- `BASE_URL` (e.g. http://localhost:3000)
	- `CORS_ORIGIN` (frontend origin, e.g. http://localhost:5173)
	- `PORT` (server port, optional)
	- `GOOGLE_CLIENT_ID`
	- `GOOGLE_CLIENT_SECRET`
	- `SESSION_SECRET`
	- `JWT_SECRET`
	- `EMAIL_USER` / `EMAIL_PASS` (SMTP credentials for verification emails)
	- `SUPABASE_URL`
	- `SUPABASE_ANON_KEY`
	- `SUPABASE_SERVICE_ROLE_KEY`
	- `OPENAI_API_KEY` (if using chatbot features)
- Frontend (Vite env keys):
	- `VITE_API_URL`
	- `VITE_SUPABASE_URL`
	- `VITE_SUPABASE_KEY`
	- `VITE_GOOGLE_CLIENT_ID`

Production environment variables should be configured via your hosting platform (Render/Netlify/Supabase) and not committed to the repository.

---

## Running the Application

### Start the Backend Server

From the backend folder:

```bash
npm run dev
```

### Start the Frontend Application

From the frontend folder:

```bash
npm run dev
```

The frontend development server link will appear in the terminal after startup.


## Coverage

- **Backend:** From the `backend` folder run:

```bash
npm run test:coverage
```

Coverage output is written to `backend/coverage` (HTML and lcov formats).

- **Frontend:** From the `frontend` folder run:

```bash
npx vitest run --coverage
```

Frontend coverage artifacts are written to `frontend/coverage`.

---

## Project Structure

```
SD-Web-App/
│
├── .github/
│   └── workflows/
│
├── backend/
│   ├── src/
│   ├── tests/
|   ├── scripts/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env
│   ├── .env.example
|   ├── README.md
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── README.md
├── codecov.yml
├── package.json
└── package-lock.json
```

---

## Technology Stack

- Frontend: React.js, JavaScript, HTML5, CSS3
- Backend: Node.js, Express.js
- Database: Supabase (PostgreSQL)
- Authentication: Google OAuth 2.0
- Deployment: Render & Netlify
- CI/CD: GitHub Actions
- Testing: Jest & Vitest

---

## Team

Always in SYNNK!

### Members
 
Shannon Chisanga, Yannis Njanfang Patu, Nhlamulo Mabuza, Natasha Dobah and Kirsten Strydom