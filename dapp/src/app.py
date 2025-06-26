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

def get_app_secret():
    chatGptApiKey = os.getenv("IEXEC_APP_DEVELOPER_SECRET")
    if chatGptApiKey:
        # Replace all characters with '*'
        redacted_app_secret = '*' * len(chatGptApiKey)
        print(f"Got an app secret ({redacted_app_secret})!")
    else:
        print("App secret is not set")
    return chatGptApiKey

def parse_protected_data(json_string):
    try:
        return json.loads(json_string)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON data: {e}")
    except Exception as e:
        print('It seems there is an issue with your protected data:', e)

def ollama_server_command():
    subprocess.run(
        ["ollama", "serve"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True
    )

def start_ollama_server():
    threading.Thread(target=ollama_server_command, daemon=True).start()
    time.sleep(5)

def query_ollama_text(prompt):
    """Query Ollama with text only"""
    data = {
        "model": "llava:7b",
        "prompt": prompt,
        "stream": False
    }
    try:
        response = requests.post(server_model_url, json=data)
        return response.json()["response"]
    except Exception as e:
        return f"Error: {str(e)}"

def process_data(parsed_content):
    # Get description from all memories
    descriptions = [entry["description"] for entry in parsed_content]
    print("Descriptions:", descriptions)
    # TODO Call ChatGPT api
    prompt = f"""
        You are a helpful assistant.
        Here are some memories:"
        {"\n".join(descriptions)}
        Give me a short paragraph for each memory?
    """
    result = query_ollama_text(prompt)
    print("Result from Ollama:", result)
    return "Ok"

def main():
    IEXEC_OUT = os.getenv('IEXEC_OUT')
    computed_json = {}
    try:
        print("Starting Condidly dapp...")
        get_app_secret()
        parsed_data = parse_protected_data(protected_data.get("memories.json"))
        start_ollama_server()
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
