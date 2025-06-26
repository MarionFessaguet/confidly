import json
import os
import subprocess
import time
import threading
import requests
import base64
import protected_data
import asyncio

IEXEC_OUT = os.getenv('IEXEC_OUT')

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
    with open(IEXEC_OUT + '/ollama.log', 'w') as f:
        subprocess.run(
            ["ollama", "serve"],
            stdout=f,
            stderr=f,
            check=True
        )

def start_ollama_server():
    threading.Thread(target=ollama_server_command, daemon=True).start()
    time.sleep(5)

def query_ollama_text(prompt):
    """Query Ollama with text only"""
    data = {
        "model": "qwen3:8b",
        "prompt": prompt,
        "stream": False
    }
    try:
        response = requests.post(server_model_url, json=data)
        return response.json()["response"]
    except Exception as e:
        return f"Error: {str(e)}"


def extract_html_content(text):
    """
    Extract HTML content between ```html and ``` markers.
    Args:
        text (str): The text containing HTML code blocks
    Returns:
        str: The extracted HTML content, or empty string if not found
    """
    # Pattern to match content between ```html and ```
    pattern = r'```html\s*(.*?)\s*```'
    # Find all matches
    matches = re.findall(pattern, text, re.DOTALL)
    if matches:
        # Return the first match (or join all if you want multiple blocks)
        return matches[0].strip()
    else:
        return ""

def extract_articles_and_images(articles):
    """
    Process articles and their images, creating a mapping of image URLs.
    Converts the PHP-like code to Python.
    """
    image_map = {}  # Python equivalent of map = array()
    for article in articles:
        if 'images' in article and isinstance(article['images'], list):
            for n, image in enumerate(article['images']):
                key = f'https://foo.bar/{len(image_map)}'
                image_map[key] = image
                article['images'][n] = key
    return articles, image_map

def replace_mapped_urls_in_html(html_content, image_map):
    """
    Replace mapped URLs back to their original values in HTML content.
    Converts the PHP foreach loop to Python.
    """
    for key, value in image_map.items():
        html_content = html_content.replace(key, value)
    return html_content

async def generate_pdf_from_html(html_content, pdf_path):
    browser = await launch()
    page = await browser.newPage()
    
    await page.setContent(html_content)
    
    await page.pdf({'path': pdf_path, 'format': 'A4'})
    
    await browser.close()


def process_data(parsed_content):
    # Get description from all memories
    # descriptions = [entry["description"] for entry in parsed_content]
    # print("Descriptions:", descriptions)

    articles, image_map = extract_articles_and_images(parsed_content) #parsed_content = list of protected data

    #prompt to be modified according to protected data
    prompt = """
I'm giving you some article content and the instructions will come just after.
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
  "description": "Canicule et orage, c'est la loose",
  "locale": "fr",
  "emotion": "il fait trop chaud!"
 }
```
Now I want you to generate a kind of journal with this list of articles, each representing different event or memories of different authors. you need to consider them unrelated. The journal language will be "EN" so translate the article content when needed. The journal will be generated in HTML format in a single page following all instructions. The theme of the journal should be "familly time for a summer party". You need to be really creative like a designer and make effort to make it look nice and fresh. Each article will represent an event. You are allowed to enhance the description to make them match the journal entry. Each article will be represented in a JSON format. You can ignore the "v" field. The "date" field contains the date or datetime of the event. The "locale" field represents the language used for writing the content of the "title" and "description". You can find an "emotion" field expressing what the author was feeling when the event occurred. Use it for your customization of the tone of this journal entry but do not display it back. The "images" field is a list of images URL an dyou should them all in the generate ouput. if necessary pick one as the main on and siplay the other at the end of the article. The "location" field represents the location of the event if filled.
Please generate the journal in a html code.
Give me only the html file content and nothing else!
    """
    result = query_ollama_text(prompt)
    curated_result = extract_html_content(result)
    print("Curated result from Ollama:", curated_result)

    replace_mapped_urls_in_html(curated_result, image_map) 

    #gener pdf
    generate_pdf_from_html(html_content, pdf_path)

    return curated_result

def main():
    computed_json = {}
    try:
        print("Starting Condidly dapp...")
        get_app_secret()
        parsed_data = parse_protected_data(protected_data.get("memories.json"))
        start_ollama_server()
        # response = process_data(parsed_data)
        response = "dummy response for testing purposes"
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
