FROM python:3.9

WORKDIR /app

COPY requirements.txt /app/
RUN pip install -r requirements.txt

COPY function_server /app/function_server

EXPOSE 5000

CMD ["uvicorn", "function_server.app:app", "--host", "0.0.0.0", "--port", "5000", "--root-path", "/api/function-server"]