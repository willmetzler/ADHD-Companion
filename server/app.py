#!/usr/bin/env python3
import os
from flask import Flask, request, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt

from models import db, User, Journal

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

CORS(app)
bcrypt = Bcrypt(app)
migrate = Migrate(app, db)
db.init_app(app)

@app.get('/api/users')
def index():
    return [u.to_dict() for u in User.query.all()], 200

@app.get('/api/users/<int:id>')
def users_by_id(id):
    user = User.query.where(User.id == id).first()
    if user:
        return user.to_dict(), 200
    else:
        return {'error': 'Not found'}, 404

@app.post('/api/users')
def create_user():
    try:
        new_user = User(username=request.json['username'], first_name=request.json['first_name'], last_name=request.json['last_name'])
        # using the bcrypt library to hash the password
        new_user._hashed_password = bcrypt.generate_password_hash(request.json['_hashed_password']).decode('utf-8')
        db.session.add(new_user)
        db.session.commit()
        session['user_id'] = new_user.id  # Store the user ID in the session
        return new_user.to_dict(), 201
    except Exception as e:
        return { 'error': str(e) }, 406
    
@app.get('/api/get-session')
def get_session():
    user_id = session.get('user_id')  # Retrieve the user ID from the session
    if user_id:
        user = User.query.get(user_id)
        if user:
            return user.to_dict(), 200
    return {}, 204

@app.post('/api/login')
def login():
    username = request.json.get('user')
    password = request.json.get('password')
    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user._hashed_password, password):
        session['user_id'] = user.id
        return user.to_dict(), 201
    else:
        return {'error': 'Username or password was invalid'}, 401

@app.delete('/api/logout')
def logout():
    session.pop('user_id')
    return {}, 204

if __name__ == '__main__':
    app.run(port=5555, debug=True)
