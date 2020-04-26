# Grab the latest alpine image
# FROM alpine:latest
FROM ubuntu:latest

# Install python and pip
# RUN apk add --no-cache --update python3 py3-pip bash

RUN apt update
RUN apt -qy install python3 python3-pip bash build-essential ffmpeg git

ADD ./server/requirements.txt /tmp/requirements.txt

# Install dependencies
RUN pip3 install --no-cache-dir -q -r /tmp/requirements.txt

# Add our code
ADD ./server /opt/server/
WORKDIR /opt/server

# Expose is NOT supported by Heroku
# EXPOSE 5000 		

RUN pip3 install --upgrade setuptools

# RUN fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile && free -m

# Run the image as a non-root user
RUN useradd -m myuser
USER myuser

# Run the app.  CMD is required to run on Heroku
# $PORT is set by Heroku			
CMD gunicorn --bind 0.0.0.0:$PORT wsgi 

