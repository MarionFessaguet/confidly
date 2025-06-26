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

def start_ollama_server():
    subprocess.run(["ollama", "serve"], check=True)

def query_ollama_text(prompt):
    """Query Ollama with text only"""
    url = "http://localhost:11434/api/generate"
    data = {
        "model": "qwen3:8b",
        "prompt": prompt,
        #"system": "You are a professional English to French translator. Just translate",
        "stream": False
    }

    try:
        response = requests.post(url, json=data)
        return response.json()["response"]
    except Exception as e:
        return f"Error: {str(e)}"


# ⚠️ Your Python code will be run in a python v3.8.3 environment

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
    #text_response = query_ollama_text("""
    #Generate a beautiful, clean HTML template that displays the image in this url:
    #https://plus.unsplash.com/premium_photo-1667030474693-6d0632f97029?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D 
    #and a corresponding description field. Requirements are: 
    #Use HTML and CSS only (no JavaScript), 
    #Fixed dimensions of 300px width and length for the image in the url,
    #The image should be visually styled (e.g., a dashed border, centered), 
    #Below the image, include a styled text box or section to describe the image, 
    #Make it aesthetically pleasing using modern design (e.g., soft colors, rounded corners, nice font), 
    #Output only the HTML+CSS code in a single file by embedding the CSS in a <style> tag.
    #Return me only the code.
    #""")
    text_response = query_ollama_text("""
        I’m giving you some article content and the instructions will come just after.
New article content:
```
{
  "v": "1",
  "datetime": "2025-06-26",
  "location": "Lyon, France",
  "images": {
   "0": "https://cf.ltkcdn.net/family/images/std/200821-800x533r1-family.jpg",
   "1": "https://www.udel.edu/academics/colleges/canr/cooperative-extension/fact-sheets/building-strong-family-relationships/_jcr_content/par_udel/columngenerator/par_1/image.coreimg.jpeg/1718801838338/family.jpeg"
  }
  "title": "Hackathon",
  "description": "1ère journée au hackathon, ca démarre fort!",
  "locale": "fr",
  "emotion": "fun"
 }
```
New article content:
```
{
  "v": "1",
  "datetime": "2025-06-25",
  "location": "Villeurbanne, France",
  "images": {
   "0": "https://img-4.linternaute.com/mZzMeIW6-NwGfAYVa-5g2t4lNEg=/1080x/smart/3f4c560443a6452fac2676cf0c1e57c0/ccmcms-linternaute/45964290.jpg"
  },
  "title": "Météo",
  "description": "Canicule et orage, c’est la loose",
  "locale": "fr",
  "emotion": "il fait trop chaud!"
 }
```
Now I want you to generate a kind of journal with this list of articles, each representing different event or memories of different authors. you need to consider them unrelated. The journal language will be "EN" so translate the article content when needed. The journal will be generated in HTML format in a single page following all instructions. The theme of the journal should be "familly time for a summer party". You need to be really creative like a designer and make effort to make it look nice and fresh. Each article will represent an event. You are allowed to enhance the description to make them match the journal entry. Each article will be represented in a JSON format. You can ignore the "v" field. The "date" field contains the date or datetime of the event. The "locale" field represents the language used for writing the content of the "title" and "description". You can find an "emotion" field expressing what the author was feeling when the event occurred. Use it for your customization of the tone of this journal entry but do not display it back. The "images" field is a list of images URL an dyou should them all in the generate ouput. if necessary pick one as the main on and siplay the other at the end of the article. The "location" field represents the location of the event if filled.
Please generate the journal in a local html and let me download it.
    """
    )
    print("text_response content:")
    print(text_response)


    with open(IEXEC_OUT + '/result.html', 'w') as f:
        f.write(text_response)
    computed_json = {'deterministic-output-path': IEXEC_OUT + '/result.html'}
except Exception as e:
    print(e)
    computed_json = {'deterministic-output-path': IEXEC_OUT,
                     'error-message': 'Oops something went wrong'}
finally:
    with open(IEXEC_OUT + '/computed.json', 'w') as f:
        json.dump(computed_json, f)
