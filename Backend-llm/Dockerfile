# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app/Backend-llm

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# Copy application code
COPY . .

# Expose FastAPI default port
EXPOSE 8001

# Start FastAPI app
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8001"]