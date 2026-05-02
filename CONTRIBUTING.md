# Contributing to Multi-User Whiteboard

Thank you for your interest in contributing! Here are some guidelines to follow.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/multiuser-whiteboard.git`
3. Create a virtual environment and install dependencies (see README.md)
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Code Style

- Follow PEP 8 for Python code
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic
- Use 4 spaces for indentation (no tabs)

## Making Changes

1. Make your changes in your feature branch
2. Test your changes locally
3. Ensure the app still runs correctly with `python app.py`
4. Test with multiple browser tabs to verify real-time sync

## Commit Messages

- Use clear, descriptive commit messages
- Start with a verb in present tense (e.g., "Add", "Fix", "Update")
- Example: `Add color picker functionality`

## Pull Requests

1. Push your branch to your fork: `git push origin feature/your-feature-name`
2. Open a Pull Request from your fork to the main repository
3. Describe your changes in the PR description
4. Reference any related issues

## Areas for Improvement

- [ ] Add eraser tool
- [ ] Add shape drawing (rectangles, circles, lines)
- [ ] Add undo/redo functionality
- [ ] Add text tool
- [ ] Improve canvas state sync across sessions
- [ ] Add room-based sessions (multiple whiteboards)
- [ ] Replace in-memory state with a database
- [ ] Add WebSocket fallback for offline mode
- [ ] Improve mobile responsiveness
- [ ] Add user avatars or cursor indicators

## Reporting Issues

- Use the GitHub Issues tab
- Include steps to reproduce the bug
- Mention your browser and OS
- Include screenshots if applicable

## Questions?

Feel free to reach out to the maintainers or open a discussion.
