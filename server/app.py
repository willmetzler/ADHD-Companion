#!/usr/bin/env python3
import os
from flask import Flask, request, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta, timezone

from models import db, User, Journal, Mood, Medications

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

CORS(app)
bcrypt = Bcrypt(app)
migrate = Migrate(app, db)
db.init_app(app)


#USER LOGIN/SIGNUP ETC..
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



#JOURNALS
@app.get('/api/journals')
def get_journals():
    user_id = session.get('user_id')
    if user_id:
        journals = Journal.query.filter_by(user_id=user_id).all()
        response = jsonify([journal.to_dict() for journal in journals])
        print(f"Journals: {response.get_json()}")  # Add this line
        return response, 200
    else:
        return jsonify({'error': 'User not logged in'}), 401

@app.post('/api/journals')
def create_journal():
    user_id = session.get('user_id')
    if user_id:
        try:
            new_journal = Journal(
                journal_header=request.json['journal_header'],
                journal_text=request.json['journal_text'],
                user_id=user_id
            )
            db.session.add(new_journal)
            db.session.commit()
            return jsonify(new_journal.to_dict()), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'error': 'User not logged in'}), 401

@app.get('/api/mood-ratings')
def get_mood_ratings():
    user_id = session.get('user_id')
    if user_id:
        moods = Mood.query.filter_by(user_id=user_id).all()
        mood_ratings = [{'created_at': mood.created_at, 'mood': mood.mood_rating} for mood in moods]
        response = jsonify(mood_ratings)
        print(f"Mood Ratings: {response.get_json()}")  # Add this line
        return response, 200
    else:
        return jsonify({'error': 'User not logged in'}), 401

@app.post('/api/mood-ratings')
def submit_mood_rating():
    user_id = session.get('user_id')
    if user_id:
        try:
            # Check if a mood rating for today already exists for the user
            today = datetime.now().date()
            existing_rating = Mood.query.filter_by(user_id=user_id, created_at=today).first()
            if existing_rating:
                # Update the existing mood rating
                existing_rating.mood_rating = request.json['mood']
                db.session.commit()
                return jsonify({'message': 'Mood rating updated successfully'}), 200
            else:
                # Create a new mood rating
                new_mood = request.json['mood']
                if new_mood not in range(1, 6):
                    return jsonify({'error': 'Invalid mood rating'}), 400
                new_mood = Mood(mood_rating=new_mood, user_id=user_id)
                db.session.add(new_mood)
                db.session.commit()
                return jsonify({'message': 'Mood rating submitted successfully'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'error': 'User not logged in'}), 401


@app.post('/api/journal-entries')
def submit_journal_entry():
    user_id = session.get('user_id')
    if user_id:
        try:
            journal_header = request.json.get('journal_header', 'Journal Entry')
            journal_text = request.json.get('journal_text', '')
            new_journal = Journal(journal_header=journal_header, journal_text=journal_text, user_id=user_id)
            db.session.add(new_journal)
            db.session.commit()
            return jsonify({'message': 'Journal entry submitted successfully'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'error': 'User not logged in'}), 401


@app.put('/api/journals/<int:id>')
def edit_journal_entry(id):
    user_id = session.get('user_id')
    if user_id:
        try:
            journal_entry = Journal.query.filter_by(id=id, user_id=user_id).first()
            if journal_entry:
                journal_entry.journal_header = request.json.get('journal_header', journal_entry.journal_header)
                journal_entry.journal_text = request.json.get('journal_text', journal_entry.journal_text)
                db.session.commit()
                return jsonify({'message': 'Journal entry updated successfully'}), 200
            else:
                return jsonify({'error': 'Journal entry not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'error': 'User not logged in'}), 401

@app.delete('/api/journals/<int:id>')
def delete_journal_entry(id):
    user_id = session.get('user_id')
    if user_id:
        try:
            journal_entry = Journal.query.filter_by(id=id, user_id=user_id).first()
            if journal_entry:
                db.session.delete(journal_entry)
                db.session.commit()
                return jsonify({'message': 'Journal entry deleted successfully'}), 200
            else:
                return jsonify({'error': 'Journal entry not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'error': 'User not logged in'}), 401
    


# MEDICATIONS

@app.get('/api/medications')
def get_medications():
    user_id = session.get('user_id')
    if user_id:
        medications = Medications.query.filter_by(user_id=user_id).all()
        return jsonify([medication.to_dict() for medication in medications]), 200
    else:
        return jsonify({'error': 'User not logged in'}), 401

@app.post('/api/medications')
def add_medication():
    user_id = session.get('user_id')
    if user_id:
        try:
            new_medication = Medications(
                drug_name=request.json['drug_name'],
                dosage=request.json['dosage'],
                prescriber=request.json['prescriber'],
                renew_date=request.json['renew_date'],
                user_id=user_id
            )
            db.session.add(new_medication)
            db.session.commit()
            return jsonify(new_medication.to_dict()), 201
        except Exception as e:
            return jsonify({'error': 'Failed to add medication', 'details': str(e)}), 400
    else:
        return jsonify({'error': 'User not logged in'}), 401


@app.delete('/api/medications/<int:id>')
def delete_medication(id):
    user_id = session.get('user_id')
    if user_id:
        try:
            medication = Medications.query.filter_by(id=id, user_id=user_id).first()
            if medication:
                db.session.delete(medication)
                db.session.commit()
                return jsonify({'message': 'Medication deleted successfully'}), 200
            else:
                return jsonify({'error': 'Medication not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'error': 'User not logged in'}), 401

@app.put('/api/medications/<int:id>')
def update_medication(id):
    user_id = session.get('user_id')
    if user_id:
        try:
            medication = Medications.query.filter_by(id=id, user_id=user_id).first()
            if medication:
                medication.drug_name = request.json.get('drug_name', medication.drug_name)
                medication.dosage = request.json.get('dosage', medication.dosage)
                medication.prescriber = request.json.get('prescriber', medication.prescriber)
                medication.renew_date = request.json.get('renew_date', medication.renew_date)
                
                db.session.commit()
                return jsonify({'message': 'Medication updated successfully'}), 200
            else:
                return jsonify({'error': 'Medication not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'error': 'User not logged in'}), 401


if __name__ == '__main__':
    app.run(port=5555, debug=True)
