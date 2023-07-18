FROM --platform=linux/amd64 python:3.11.4

WORKDIR /usr/src/app
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY app .

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "-k", "geventwebsocket.gunicorn.workers.GeventWebSocketWorker", "-w", "1", "run:app"]

EXPOSE 8000