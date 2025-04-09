FROM python:3.10.4-slim-bullseye

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /backend

COPY ./requirements.txt .

RUN pip install --upgrade pip \
    && pip install -r requirements.txt

COPY . .