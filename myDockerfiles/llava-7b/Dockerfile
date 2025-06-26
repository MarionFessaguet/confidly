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
COPY configure.sh /app/configure.sh
RUN chmod +x /app/configure.sh

# Run the script during build
RUN /app/configure.sh