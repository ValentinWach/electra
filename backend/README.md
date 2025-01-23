# Backend Server

This is the backend server for the election system, built with FastAPI.

## Requirements

Python >= 3.7

## Installation & Usage

1. Create and activate a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
```

2. Install dependencies (choose one option):

Using uv (recommended, faster):
```bash
uv venv .venv
uv pip install -e .
```

Using pip:
```bash
pip install -e .
```

3. Set up environment variables:
Copy `.env.example` to `.env` and update the values as needed.

4. Run the server:
```bash
uvicorn src.openapi_server.main:app --reload
```

The API documentation will be available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

### Running with Docker

```bash
docker-compose up --build
```

### Running Tests

Using uv:
```bash
uv pip install pytest
pytest tests
```

Using pip:
```bash
pip install pytest
pytest tests
```
