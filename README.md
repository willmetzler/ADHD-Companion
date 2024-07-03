# ADHD Companion App

## Overview
The ADHD Companion App is a web application designed to help individuals manage their ADHD symptoms by tracking their mood, journaling, managing tasks, and keeping track of medications. The app features a calendar view for mood tracking, daily journal entries, a to-do list, and medication reminders.

## Features
- Mood Rating with Calendar View: Track your mood daily and visualize it on a calendar.
- Journal Entries & Diary: Maintain daily journal entries and view them in a diary format.
- To-do Lists: Manage your tasks with a to-do list feature.
- Medication Tracking: Keep track of your medication schedules and reminders.

# Installation
## Prerequisites
Node.js and npm installed on your machine.
Python installed on your machine.
A PostgreSQL database.
## Run Database Migrations
flask db init
flask db migrate
flask db upgrade
## Run the Backend Server
python app.py
## Frontend Setup
cd client
npm install
npm run dev

# Dependencies
## Frontend
React: A JavaScript library for building user interfaces.
React Router Dom: Declarative routing for React applications.
FontAwesome: For icons.
FullCalendar: For calendar view.
Trend Micro React SideNav: For the sidebar navigation.
Vite: Next-generation frontend tooling.
## Backend
Flask: A lightweight WSGI web application framework.
SQLAlchemy: SQL toolkit and Object-Relational Mapping (ORM) library for Python.
Flask-Migrate: Handle SQLAlchemy database migrations for Flask applications using Alembic.
Bcrypt: For hashing passwords.

## License
This project is licensed under the MIT License.
