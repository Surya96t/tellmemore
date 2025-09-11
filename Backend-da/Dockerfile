# Use official Python image as base
FROM python:3.11-slim

# Set working directory
WORKDIR /app/Backend-da

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# Copy application code
COPY . .

# Expose FastAPI default port
EXPOSE 8000

# Run the FastAPI app using uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
