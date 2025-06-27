FROM python-ollama-qwen3-8b:local

RUN apt-get update && apt-get install -y wkhtmltopdf

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY . .

ENTRYPOINT ["python3", "/app/src/app.py"]
