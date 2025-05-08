# Use Python base image
FROM python:3.9.6

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy entire project BEFORE installing requirements (required for local path references)
COPY . .

# Create and activate virtual environment with uv
RUN uv venv && uv pip install -r requirements.txt

# Set environment path so all following commands use the venv
ENV PATH="/app/.venv/bin:$PATH"

# Expose the app port
EXPOSE 8000

# Start the application
CMD ["python", "run_server.py", "prod"]
