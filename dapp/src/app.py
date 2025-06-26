import json
import os
import sys

import subprocess
import time
import threading
import requests
import base64
import io

import protected_data

server_model_url = "http://localhost:11434/api/generate"

def start_ollama_server():
    subprocess.run(["ollama", "serve"], check=True)

def query_ollama_text(prompt):
    """Query Ollama with text only"""
    data = {
        "model": "llava:7b",
        "prompt": prompt,
        #"system": "You are a professional English to French translator. Just translate",
        "stream": False
    }
    try:
        response = requests.post(server_model_url, json=data)
        return response.json()["response"]
    except Exception as e:
        return f"Error: {str(e)}"

def query_ollama_vision(prompt, image_path):
    """Query Ollama with text and image"""
    # Convert image to base64
    with open(image_path, "rb") as img_file:
        img_data = base64.b64encode(img_file.read()).decode()
    data = {
        "model": "llava:7b",
        "prompt": prompt,
        "images": [img_data],
        "stream": False
    }
    try:
        response = requests.post(server_model_url, json=data)
        return response.json()["response"]
    except Exception as e:
        return f"Error: {str(e)}"


def main():
    IEXEC_OUT = os.getenv('IEXEC_OUT')
    computed_json = {}
    try:
        messages = []
        args = sys.argv[1:]
        print(f"Received {len(args)} args")
        if len(args) > 0:
            messages.append(" ".join(args))
        try:
            # The protected data mock created for the purpose of this Hello World journey
            # contains an object with a key "secretText" which is a string
            protected_text = protected_data.getValue('secretText', 'string')
            messages.append(protected_text)
        except Exception as e:
            print('It seems there is an issue with your protected data:', e)
        # YOUR task:
        # Start server in background
        server_thread = threading.Thread(target=start_ollama_server, daemon=True)
        server_thread.start()
        time.sleep(5)
        text_response = query_ollama_text("Do you know iExec ?")
        #print(f"Response: {text_response}")
        with open(IEXEC_OUT + '/result.txt', 'w') as f:
            f.write(text_response)
        computed_json = {'deterministic-output-path': IEXEC_OUT + '/result.txt'}
    except Exception as e:
        print(e)
        computed_json = {'deterministic-output-path': IEXEC_OUT,
                        'error-message': 'Oops something went wrong'}
    finally:
        with open(IEXEC_OUT + '/computed.json', 'w') as f:
            json.dump(computed_json, f)
