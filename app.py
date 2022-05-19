import os
from flask import Flask, redirect, request, jsonify, render_template
from faker import Faker
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import SyncGrant
from dotenv import load_dotenv

users = []
currUser = ''

app = Flask(__name__)
fake = Faker()

load_dotenv()


@app.route('/token')
def generate_token():
    global currUser
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    api_key = os.getenv('TWILIO_API_KEY')
    api_secret = os.getenv('TWILIO_API_SECRET')
    sync_service_sid = os.getenv('TWILIO_SYNC_SERVICE_SID')
    username = request.args.get('username', currUser)

    token = AccessToken(account_sid, api_key, api_secret, identity=username)

    sync_grant = SyncGrant(sync_service_sid)
    token.add_grant(sync_grant)
    return jsonify(identity=username, token=token.to_jwt())


@app.route('/')
def index():
    return render_template('login.html')


@app.route('/validateLogin', methods=['POST'])
def handle_login():
    global currUser
    user = request.form['user']
    if user in users:
        return render_template('login.html', error="Username already exists")

    users.append(user)
    currUser = user
    return redirect('/index', code=302)


@app.route('/index')
def handle_data():
    global currUser
    return render_template('index.html', userList=users, username=currUser)


if __name__ == "__main__":
    app.run()
