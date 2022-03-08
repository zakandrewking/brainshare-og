FROM python:3.9

WORKDIR /app

COPY requirements.txt /app/
RUN pip install -r requirements.txt

COPY table_parser /app/table_parser

EXPOSE 5000

CMD [ "python", "-m", "table_parser" ]
