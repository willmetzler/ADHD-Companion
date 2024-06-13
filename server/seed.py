#!/usr/bin/env python3

from app import app
from models import db, User, Mood, Journal
from random import randint
from faker import Faker
from datetime import date, timedelta

faker = Faker()

if __name__ == '__main__':
    with app.app_context():
        print("Seeding database...")
        User.query.delete()
        Mood.query.delete()
        Journal.query.delete()

        print("Creating User")
        will = User(first_name="Will", last_name="Metzler", username="willmetzler", _hashed_password='123')
        db.session.add(will)

        print("Creating Mood Ratings")
        
        def generate_random_mood_rating():
            return randint(1, 5)

        # Function to populate mood ratings for a given month and user ID
        def populate_mood_ratings_for_month(start_date, end_date, user_id):
            current_date = start_date
            while current_date <= end_date:
                mood_rating = generate_random_mood_rating()
                new_mood = Mood(mood_rating=mood_rating, user_id=user_id, created_at=current_date)
                db.session.add(new_mood)
                current_date += timedelta(days=1)

        # Populate mood ratings for May
        populate_mood_ratings_for_month(date(2024, 5, 1), date(2024, 5, 31), user_id=1)

        # Populate mood ratings for June (up until today)
        today = date.today()
        populate_mood_ratings_for_month(date(2024, 6, 1), today, user_id=1)

        # Commit changes to the database
        db.session.commit()


        print("Seeding complete!")
