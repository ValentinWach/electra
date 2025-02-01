# Electra - Election Analysis System

Electra is an election analysis and voting system. The system consists of three main components: a results analysis platform, a voting interface for citizens, and an administrative dashboard.

## System Architecture

The project is split into two main components:

### Frontend (React + TypeScript)
- Built with React 18, TypeScript, and Vite
- Features interactive visualizations using Chart.js, D3.js, and Leaflet
- Three sub-applications:
  - **Ergebnisse** (`/ergebnisse`): Election results analysis
  - **Voting** (`/stimmabgabe`): Citizen voting interface
  - **Admin** (`/admin`): Administrative tools

### Backend (FastAPI + PostgreSQL)
- Built with FastAPI, SQLAlchemy and PostgreSQL
- Utilizes materialized views for efficient API requests
- Supports both development and production configurations
- Scalable with multi-worker deployment options

## Getting Started

Each frontend and backend have their own README.md file in their respective directories. The following is a quick summary of both.

### Prerequisites

- Python >= 3.10
- Node.js (LTS version, best 22.12.0 or higher)
- PostgreSQL 17.1
- pip and npm
- uv (Python package manager)

### Backend Setup

1. Navigate to the `backend` directory and create both a virtual environment and install the dependencies at the same time via:
```bash
uv sync
```

2. Set up the database:
- Install and setup a Postgres database
- Create an `.env` file based on `.env.example`
- Run database setup:
```bash
python .\database-tools\scripts\setup_database.py
```

3. Start the server:
- Development mode:
```bash
python run_server.py dev
```
- Production mode:
```bash
python run_server.py prod
```

The API will be available at:
- Main endpoint: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Frontend Setup

1. Navigate to the `frontend` directory and install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

For production:
```bash
npm run prod
```

The frontend will be available at:
- `http://localhost:5173`

## Development Notes

- Keep default port settings (Frontend: 5173, Backend: 8000) for proper CORS configuration
- Frontend is optimized for Chromium browsers
- Active internet connection required for proper font loading from CDN for frontend

## Project Structure

```
├── backend/              # FastAPI backend server
│   ├── src/             # Source code
│   └── database-tools/  # Database setup and election result calculation logic
├── frontend/            # React frontend application
│   ├── src/            # Source code
│   ├── public/         # Static files
│   └── dist/           # Build output
└── benchmark/          # Performance testing
```