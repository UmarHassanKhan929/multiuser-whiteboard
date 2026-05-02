# Multi-User Whiteboard

![Python](https://img.shields.io/badge/Python-3.x-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.1.1-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)

A real-time collaborative whiteboard application that allows multiple users to draw on a shared canvas simultaneously. Built with **Flask** and **Twilio Sync SDK**, featuring a mutual exclusion locking system to prevent drawing conflicts.

## Features

- **Real-Time Collaboration** -- Multiple users share a single canvas synchronized via Twilio Sync
- **Mutual Exclusion Control** -- Queue-based locking system ensures only one user draws at a time
- **User Authentication** -- Simple username-based login with duplicate prevention
- **Color Picker** -- Choose your drawing color
- **Clear Board** -- Wipe the canvas clean (control required)
- **Canvas Persistence** -- Auto-saves to `localStorage`, survives page refreshes
- **Mobile Touch Support** -- Works on tablets and phones
- **User Presence** -- See all currently connected users
- **Responsive Design** -- Adapts to different screen sizes

## Tech Stack

| Layer              | Technology                            |
| ------------------ | ------------------------------------- |
| **Backend**        | Flask 2.1.1 (Python)                  |
| **Real-Time Sync** | Twilio Sync SDK                       |
| **Authentication** | Twilio Access Token + JWT             |
| **Frontend**       | HTML5, CSS3, JavaScript, jQuery 3.6.0 |
| **UI**             | Bootstrap 3.4.1                       |
| **Drawing**        | HTML5 Canvas API                      |

## Architecture

```
User Browser <--HTTP/REST--> Flask Server
                                    |
                                    v
                           Twilio Sync Cloud (WebSocket)
                                    |
                                    v
User Browser <--Real-Time Sync--> Twilio Sync Client
```

### How It Works

1. User enters a unique username on the login page
2. Server generates a Twilio Access Token with Sync Grant
3. Client connects to Twilio Sync and joins the `drawingData` stream
4. Only the user with **control** can draw; others must request access
5. Drawing events are published to Twilio Sync and broadcast to all connected clients
6. Canvas state is persisted in `localStorage` for recovery

## Prerequisites

- Python 3.x
- A [Twilio account](https://www.twilio.com/) with Sync Service enabled
- Twilio Account SID, API Key, API Secret, and Sync Service SID

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/UmarHassanKhan929/multiuser-whiteboard.git
   cd multiuser-whiteboard
   ```

2. **Create a virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**

   Create a `.env` file in the project root:

   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_SYNC_SERVICE_SID=your_sync_service_sid
   TWILIO_API_KEY=your_api_key
   TWILIO_API_SECRET=your_api_secret
   ```

   > Get your credentials from the [Twilio Console](https://console.twilio.com/)

5. **Run the application**

   ```bash
   python app.py
   ```

6. **Open in your browser**

   Navigate to `http://localhost:5000`

## Usage

1. **Login** -- Enter a unique username to join the session
2. **Request Control** -- Click "Request Control" to gain drawing access
3. **Draw** -- Use your mouse or touch to draw on the canvas
4. **Change Color** -- Use the color picker to select a different color
5. **Release Control** -- Click "Release Control" to pass access to the next user in queue
6. **Clear Board** -- Wipe the canvas (requires control)
7. **Check Access** -- Verify if you currently have drawing control
8. **Logout** -- Leave the session and release any held control

## Project Structure

```
multiuser-whiteboard/
├── app.py                  # Flask backend with routes and token management
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (gitignored)
├── .gitignore              # Git ignore rules
├── static/
│   ├── logincss.css        # Login page styles
│   ├── style.css           # Whiteboard page styles
│   └── main.js             # Client-side drawing and sync logic
├── templates/
│   ├── login.html          # Login page template
│   └── index.html          # Whiteboard page template
└── screenshots/            # Screenshots for README
```

## API Endpoints

| Endpoint              | Method | Description                    |
| --------------------- | ------ | ------------------------------ |
| `/`                   | GET    | Login page                     |
| `/validateLogin`      | POST   | Validate and register username |
| `/index`              | GET    | Whiteboard page                |
| `/token`              | GET    | Generate Twilio access token   |
| `/token/request`      | POST   | Request drawing control        |
| `/token/release`      | POST   | Release drawing control        |
| `/token/request/list` | GET    | Get current users and queue    |
| `/token/delete`       | POST   | Remove user and logout         |

## Security Notes

- Never commit `.env` files with real credentials to version control
- Rotate your Twilio API keys if they have been exposed
- This app uses in-memory state; data is lost on server restart
- For production, consider adding rate limiting and HTTPS

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Authors

- **Syed Mohammad Mazin**
- **Muhammad Shariq**
- **Umar Hassan Khan**

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Twilio Sync SDK](https://www.twilio.com/docs/sync) for real-time synchronization
- [Flask](https://flask.palletsprojects.com/) for the web framework
- [Bootstrap](https://getbootstrap.com/) for UI components
