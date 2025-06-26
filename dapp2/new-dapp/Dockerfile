FROM python-ollama-llava-7b:local

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY . .

ENTRYPOINT ["python3", "/app/src/app.py"]
