# Backend Server

This is the backend server for the Electra election system, built with FastAPI. The server provides a comprehensive API for managing election data, vote processing, and result calculations. It is designed to handle both real-time voting operations and post-election analysis.

## Key Components

- **Election Results Processing**: SQL queries and materialized views for efficient API requests
- **Vote Management**: Secure handling of incoming votes and token validation
- **Admin Operations**: APIs for token generation, result recalculation, and system management
- **Performance Optimization**: Pre-calculated materialized views for frequently accessed data

## Tech Stack

- **Framework:** FastAPI
- **Database:** PostgreSQL with SQLAlchemy ORM
- **API Documentation:** OpenAPI (Swagger) and ReDoc
- **Package Management:** uv
- **Performance:** Uvicorn ASGI server with multi-worker support
- **Data Processing:** Pandas for CSV data import

## Project Structure

```
backend/                     # Root directory
├── app/                    # Main application code
│   ├── apis/              # API route handlers and business logic
│   ├── database/          # Database models and connection management
│   ├── models/            # Pydantic models for request/response
│   └── main.py            # Application entry point
├── database-tools/         # Database management tools and election result calculation logic
│   ├── scripts/           # Database setup and initialization scripts together with Election CSV files
│   └── sitzverteilung/    # SQL logic to calculate seat distribution
├── requirements.txt       # Python dependencies
├── pyproject.toml        # Project configuration
└── .env.example          # Environment variables template
```

## Getting started

### Prerequisites

- Python >= 3.10
- pip
- uv (`pip install uv` globally)
- PostgreSQL 17.1

After navigating to the backend directory, run the following commands to install dependencies & start the application:

### Installation & Usage

1. Install dependencies:
```bash
uv sync
```
On Linux it might be necessary to run `sudo apt-get install libpq-dev` first, maybe even `sudo apt-get install python3-dev libpq-dev` to be able to install all postgres dependencies.

2. Set up database:
Install postgres and create an `.env` file like `.env.example`, adding your database URL. Start the database server.

3. Setup the database:
From the backend directory, run:
```bash
python database-tools/scripts/setup_database.py
```
This will reset the public schema, create the necessary tables, and insert the data for 2017 and 2021 elections read from the CSV source files in parallel. This should take about 3 minutes. After this, it will aggregate the votes (30-60 seconds), calculate election results and create relevant materialized views for the backend server.

4. Run the server:
From the backend directory, run:
```bash
python run_server.py dev
```
to start with one server and incremental builds, or
```bash
python run_server.py prod
```
to start with a production build and up to 8 parallel workers, depending on your CPU count. This is only worth with enough clients, else overhead is higher than benefits. For local testing with frontend best run with 1 worker.

Alternatively, start the server directly with uvicorn:
For Development:
```bash
uvicorn app.main:app --reload
```

For Production:
```bash
uvicorn app.main:app --workers <number of workers>
```
Healthcheck: `http://localhost:8000` should return "Electra"
The API documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
