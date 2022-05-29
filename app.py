import os
from flask import Flask, redirect, request, jsonify, render_template, url_for
from faker import Faker
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import SyncGrant
from dotenv import load_dotenv

users = {}
userQueue = []
leader = None
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
    return jsonify(identity=username, token=token.to_jwt(), userList=users, userQueue=userQueue)


@app.route('/token/request', methods=['GET', 'POST'])
def handleRequest():
    global leader
    global users

    req = request.get_json()['id']
    if leader is None:
        leader = req
        users[req] = True
    else:
        userQueue.append(req)

    return jsonify(userQueue=userQueue, users=users)


@app.route('/token/release', methods=['GET', 'POST'])
def handleRelease():
    global leader
    global users
    req = request.get_json()['id']

    if len(userQueue) > 0:
        newLeader = userQueue.pop(0)
        users[newLeader] = True
        leader = newLeader
    else:
        leader = None
    users[req] = False

    return jsonify(userQueue=userQueue, users=users)


# Get list of users in queue


@app.route('/token/request/list')
def handleRequestList():
    return jsonify(userQueue=userQueue, users=users)


@app.route('/')
def index():
    return render_template('login.html')


@app.route('/validateLogin', methods=['POST'])
def handle_login():
    global currUser
    user = request.form['user']
    if user in users.keys():
        return render_template('login.html', error="Username already exists")

    users[user] = False
    currUser = user
    return redirect('/index', code=302)


@app.route('/index')
def handle_data():
    global currUser
    return render_template('index.html', userList=users, username=currUser)


@app.route('/token/delete', methods=['GET', 'POST'])
def delete_user():
    global leader
    global users
    req = request.get_json()['id']

    if len(userQueue) > 0:
        newLeader = userQueue.pop(0)
        users[newLeader] = True
        leader = newLeader
    else:
        leader = None

    del users[req]
    print(req)
    print(users)

    return redirect(url_for('index'))
    # return render_template('login.html')


if __name__ == "__main__":
    app.run()
