import random
from datetime import datetime, timedelta
from faker import Faker
from app import db, User, Journal

fake = Faker()

def generate_mood():
    return random.randint(1, 5)

def populate_mood_values():
    users = User.query.all()

    for user in users:
        for i in range(15):
            date = datetime.now() + timedelta(days=i)
            mood = generate_mood()
            journal = Journal(
                journal_header=fake.sentence(),
                journal_text=fake.paragraph(),
                created_at=date,
                mood=mood,
                user=user
            )
            db.session.add(journal)

    db.session.commit()

if __name__ == '__main__':
    populate_mood_values()