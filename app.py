import os

from flask import Flask, request, jsonify, render_template
from faker import Faker
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import SyncGrant
from dotenv import load_dotenv

users = []
currUser = ''

app = Flask(__name__)
fake = Faker()

load_dotenv()


@app.route('/')
def index():
    return render_template('login.html')


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


@app.route('/index', methods=['POST'])
def handle_data():
    global currUser
    user = request.form['user']
    if user in users:
        return render_template('login.html', error="Username already exists")

    users.append(user)
    currUser = user
    print(request.form['user'])
    return render_template('index.html', userList=users, username=user)


if __name__ == "__main__":
    app.run()
