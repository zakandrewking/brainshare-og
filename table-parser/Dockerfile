FROM python:3.9

WORKDIR /app

COPY requirements.txt /app/
RUN pip install -r requirements.txt

COPY src /app/src

EXPOSE 5000

ENTRYPOINT [ "python" ]

CMD [ "src/app.py" ]
