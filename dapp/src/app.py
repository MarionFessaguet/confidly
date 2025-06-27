import json
import os
import subprocess
import time
import threading
import requests
import base64
import protected_data
import asyncio
import re
import pdfkit
import sys



IEXEC_OUT = os.getenv('IEXEC_OUT')
server_model_url = "http://localhost:11434/api/generate"
pdf_path = os.path.join(IEXEC_OUT, 'result.pdf')


def get_mailjet_api_key():
    mailjet_api_key = os.getenv("IEXEC_APP_DEVELOPER_SECRET")
    if mailjet_api_key:
        # Replace all characters with '*'
        redacted_app_secret = '*' * len(mailjet_api_key)
        print(f"Got an app secret ({redacted_app_secret})!")
    else:
        print("App secret is not set")
    return mailjet_api_key

def parse_protected_data(json_string):
    try:
        return json.loads(json_string)
    except Exception as e:
        print('Cannot parse your protected data:', e)

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

def process_data(parsed_content):
    articles, image_map = extract_articles_and_images(parsed_content) #parsed_content = list of protected data
    prompt = build_prompt(articles)
    result = query_ollama_text(prompt)
    curated_result = extract_html_content(result)
    print("Curated result from Ollama:", curated_result)
    html_content = replace_mapped_urls_in_html(curated_result, image_map)
    with open("file.html", "w") as f:
        f.write(html_content)
    pdfkit.from_file("file.html", pdf_path)

    return curated_result

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

def send_email_with_mailjet(recipients, subject, text_content, html_content=None, attachment_path=None,
                           sender_email=None, sender_name=None, api_key=None, api_secret=None):
    """
    Send an email with optional attachment using Mailjet API.

    Args:
        recipients (list): List of recipient email addresses
        subject (str): Email subject line
        text_content (str): Plain text email content
        html_content (str): HTML email content (optional)
        attachment_path (str): Path to file to attach (optional)
        sender_email (str): Sender's email address
        sender_name (str): Sender's name
        api_key (str): Mailjet API key
        api_secret (str): Mailjet API secret

    Returns:
        dict: Status of the email sending operation
    """
    try:
        # Check if attachment exists
        attachment_data = None
        attachment_name = None
        if attachment_path and os.path.exists(attachment_path):
            with open(attachment_path, "rb") as file:
                attachment_data = base64.b64encode(file.read()).decode('utf-8')
                attachment_name = os.path.basename(attachment_path)
        elif attachment_path:
            return {"success": False, "error": f"Attachment file not found: {attachment_path}"}

        # Prepare recipients list
        to_emails = [{"Email": email} for email in recipients]

        # Prepare email data
        email_data = {
            "Messages": [
                {
                    "From": {
                        "Email": sender_email,
                        "Name": sender_name or sender_email
                    },
                    "To": to_emails,
                    "Subject": subject,
                    "TextPart": text_content
                }
            ]
        }

        # Add HTML content if provided
        if html_content:
            email_data["Messages"][0]["HTMLPart"] = html_content

        # Add attachment if provided
        if attachment_data:
            email_data["Messages"][0]["Attachments"] = [
                {
                    "ContentType": "application/octet-stream",
                    "Filename": attachment_name,
                    "Base64Content": attachment_data
                }
            ]

        # Send email via Mailjet API
        url = "https://api.mailjet.com/v3.1/send"
        auth = (api_key, api_secret)
        headers = {"Content-Type": "application/json"}

        response = requests.post(url, json=email_data, auth=auth, headers=headers)

        if response.status_code == 200:
            result = response.json()
            return {
                "success": True,
                "message": f"Email sent successfully to {len(recipients)} recipients",
                "recipients": recipients,
                "mailjet_response": result,
                "attachment": attachment_name
            }
        else:
            return {
                "success": False,
                "error": f"Mailjet API error: {response.status_code} - {response.text}"
            }

    except Exception as e:
        return {"success": False, "error": str(e)}

def send_email(mailjet_api_secrets, mailjet_recipients):
    # sprint string "key|...|...." to get the key, secret, email and name
    mailjet_api_key, mailjet_api_secret, mailjet_sender_email = mailjet_api_secrets.split('|')
    mailjet_sender_name = 'Confidly'

    # Only send if Mailjet credentials are properly configured
    if (mailjet_api_key != '' and
        mailjet_api_secret != '' and
        mailjet_sender_email != ''):

        mailjet_status = send_email_with_mailjet(
            recipients=mailjet_recipients,
            subject="Confidly - Your magazine has arrived!",
            text_content="Please find the attached document. This email was sent using Confidly.",
            html_content="""
            <html>
                <body>
                    <h2>Important Document</h2>
                    <p>Please find the attached document.</p>
                    <p>This email was sent using <strong>Confidly</strong>.</p>
                    <p>Best regards,<br>Your Privacy Team</p>
                </body>
            </html>
            """,
            attachment_path= pdf_path,
            sender_email=mailjet_sender_email,
            sender_name=mailjet_sender_name,
            api_key=mailjet_api_key,
            api_secret=mailjet_api_secret
        )
        print("Mailjet email status:", mailjet_status)
    else:
        print("Mailjet credentials not configured. Set MAILJET_API_KEY, MAILJET_API_SECRET, MAILJET_SENDER_EMAIL, and MAILJET_SENDER_NAME environment variables.")


def build_prompt(articles):
    intro = """
I'm giving you some article content and the instructions will come just after.
"""

    article_blocks = ""
    for article in articles:
        json_article = json.dumps(article, indent=2, ensure_ascii=False)
        article_blocks += f'\nNew article content:\n```\n{json_article}\n```\n'

    instructions = """
Now I want you to generate a kind of journal with this list of articles, each representing different event or memories of different authors. you need to consider them unrelated. The journal language will be "EN" so translate the article content when needed. The journal will be generated in HTML format in a single page following all instructions. The theme of the journal should be "familly time for a summer party". You need to be really creative like a designer and make effort to make it look nice and fresh. Each article will represent an event. You are allowed to enhance the description to make them match the journal entry. Each article will be represented in a JSON format. You can ignore the "v" field. The "date" field contains the date or datetime of the event. The "locale" field represents the language used for writing the content of the "title" and "description". You can find an "emotion" field expressing what the author was feeling when the event occurred. Use it for your customization of the tone of this journal entry but do not display it back. The "images" field is a list of images URL an dyou should them all in the generate ouput. if necessary pick one as the main on and siplay the other at the end of the article. The "location" field represents the location of the event if filled.
Please generate the journal in a local html and let me download it.
"""

    return (intro + article_blocks + instructions).strip()


### main ###
def main():
    computed_json = {}
    try:
        print("Starting Confidly dapp...")
        emails = sys.argv[1:]
        print(f"Received {len(emails)} args")
        mailjet_api_secrets = get_mailjet_api_key()
        parsed_data = parse_protected_data(protected_data.getValue('memories', 'string'))
        start_ollama_server()
        response = process_data(parsed_data)
        send_email(mailjet_api_secrets, emails)
        with open(IEXEC_OUT + '/result.html', 'w') as f:
            f.write(response)
        computed_json = {'deterministic-output-path': IEXEC_OUT + '/result.html'}
    except Exception as e:
        print(e)
        computed_json = {'deterministic-output-path': IEXEC_OUT,
                        'error-message': 'Oops something went wrong'}
    finally:
        with open(IEXEC_OUT + '/computed.json', 'w') as f:
            json.dump(computed_json, f)

if __name__ == "__main__":
    main()
