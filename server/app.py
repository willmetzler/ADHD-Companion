#!/usr/bin/env python3

from flask import request, session
from config import app, db
from models import ExampleModel # import your models here!

@app.get('/')
def index():
    return "Hello world"


# write your routes here! 
# all routes should start with '/api' to account for the proxy


if __name__ == '__main__':
    app.run(port=5555, debug=True)
