import json
from typing import Dict, Set
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Map user_id -> WebSocket connection
        self.user_to_connection: Dict[str, WebSocket] = {}

        # event_id -> set of user_ids
        self.event_to_users: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        """Establish connection and associate WebSocket with user_id."""
        await websocket.accept()
        self.user_to_connection[user_id] = websocket

    def disconnect(self, websocket: WebSocket, user_id: str):
        """Disconnect the WebSocket and remove the association."""
        if user_id in self.user_to_connection:
            self.user_to_connection.pop(user_id, None)
        # Clean user from all event rooms
        for users in self.event_to_users.values():
            users.discard(user_id)

    async def send_personal_message(self, json_data: dict, user_id: str):
        """Send a personal message to a user based on their user_id."""
        websocket = self.user_to_connection.get(user_id)
        if websocket:
            message = json.dumps(json_data)  # Convert dictionary to JSON string
            await websocket.send_text(message)
            print(f"Sent message to user {user_id}")
        else:
            print(f"No connection found for user {user_id}")

    async def broadcast(self, message: str):
        """Broadcast message to all connected users."""
        for websocket in self.user_to_connection.values():
            await websocket.send_text(message)

# --------- New for Event Chat ---------

    def join_event(self, user_id: str, event_id: str):
        """Add a user to an event chat room."""
        if event_id not in self.event_to_users:
            self.event_to_users[event_id] = set()
        self.event_to_users[event_id].add(user_id)

    def leave_event(self, user_id: str, event_id: str):
        """Remove a user from an event chat room."""
        if event_id in self.event_to_users:
            self.event_to_users[event_id].discard(user_id)

    async def send_message_to_event(self, event_id: str, message_data: dict):
        """Send a message to all users in an event."""
        user_ids = self.event_to_users.get(event_id, set())
        for user_id in user_ids:
            websocket = self.user_to_connection.get(user_id)
            if websocket:
                await websocket.send_text(json.dumps(message_data))


manager = ConnectionManager()
