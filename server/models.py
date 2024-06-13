from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime

metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

db = SQLAlchemy(metadata=metadata)

# write your models here!
class User(db.Model, SerializerMixin):
    __tablename__ = 'users_table'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False, unique=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    _hashed_password = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.now)

    journals = db.relationship('Journal', back_populates='user')
    serialize_rules = ('-journals.user',)

class Mood(db.Model, SerializerMixin):
    __tablename__ = 'mood_table'

    id = db.Column(db.Integer, primary_key=True)
    mood_rating = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('users_table.id'))  # Add this line
    journal_id = db.Column(db.Integer, db.ForeignKey('journal_table.id'))
    created_at = db.Column(db.DateTime, default=db.func.now())

    journal = db.relationship('Journal', back_populates='mood')

class Journal(db.Model, SerializerMixin):
    __tablename__ = 'journal_table'

    id = db.Column(db.Integer, primary_key=True)
    journal_header = db.Column(db.String)
    journal_text = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.now)
    user_id = db.Column(db.Integer, db.ForeignKey('users_table.id'))

    user = db.relationship('User', back_populates='journals')
    mood = db.relationship('Mood', uselist=False, back_populates='journal')
    serialize_rules = ('-user.journals',)

class Medications(db.Model, SerializerMixin):
    __tablename__ = 'medications_table'

    id = db.Column(db.Integer, primary_key=True)
    drug_name = db.Column(db.String, nullable=False)
    dosage = db.Column(db.Integer, nullable=False)
    prescriber = db.Column(db.String, nullable=False)
    renew_date = db.Column(db.String)
    user_id = db.Column(db.Integer, db.ForeignKey('users_table.id'))