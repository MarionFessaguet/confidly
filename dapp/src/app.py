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

def parse_protected_data(json_string):
    try:
        return json.loads(json_string)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON data: {e}")
    except Exception as e:
        print('It seems there is an issue with your protected data:', e)

def process_data(parsed_content):
    # Get description from all memories
    descriptions = [entry["description"] for entry in parsed_content]
    print("Descriptions:", descriptions)

    return "Ok"

def main():
    IEXEC_OUT = os.getenv('IEXEC_OUT')
    computed_json = {}
    try:
        print("Starting Condidly dapp...")
        parsed_data = parse_protected_data(protected_data.get("memories.json"))
        response = process_data(parsed_data)
        with open(IEXEC_OUT + '/result.txt', 'w') as f:
            f.write(response)
        computed_json = {'deterministic-output-path': IEXEC_OUT + '/result.txt'}
    except Exception as e:
        print(e)
        computed_json = {'deterministic-output-path': IEXEC_OUT,
                        'error-message': 'Oops something went wrong'}
    finally:
        with open(IEXEC_OUT + '/computed.json', 'w') as f:
            json.dump(computed_json, f)

if __name__ == "__main__":
    main()
