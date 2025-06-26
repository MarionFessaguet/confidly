#FROM aghia/python-ollama-llava:7b
#FROM aghia/python-ollama-codellama:7b
FROM aghia/python-ollama-qwen3:8b
WORKDIR /app
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .
ENTRYPOINT ["python3", "/app/src/app.py"]
