#!/bin/bash
set -e

# Install Ollama if not already present
if ! command -v ollama &> /dev/null; then
    echo "Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
else
    echo "Ollama already installed."
fi

# Start Ollama server in background
echo "Starting Ollama server..."
ollama serve &

# Give the server time to initialize
sleep 5

# Pull the model
echo "Pulling codellama model..."
ollama pull qwen3:8b

# Kill server after pulling
echo "Stopping Ollama server..."
pkill ollama