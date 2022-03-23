FROM python:3.9

WORKDIR /app

COPY requirements.txt /app/
RUN pip install -r requirements.txt

COPY function_server /app/function_server

EXPOSE 5000

ENV FLASK_APP=function_server.app

CMD ["python", "-m", "flask", "run", "--host=0.0.0.0"]