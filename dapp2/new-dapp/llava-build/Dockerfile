FROM python:3.13-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    bash \
    fuse \
    ca-certificates \
    git \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy your config script into the image
COPY setup.sh /app/setup.sh
RUN chmod +x /app/setup.sh

# Run the script during build
RUN /app/setup.sh