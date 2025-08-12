# Use official Python image as base
FROM python:3.11-slim

# Set working directory
WORKDIR /app/Frontend-ui

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# Copy application code
COPY . .

# Expose port (FastAPI default)
EXPOSE 8080

# Start FastAPI app using uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
