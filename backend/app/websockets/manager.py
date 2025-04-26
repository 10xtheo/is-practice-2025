import json
from typing import Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Map user_id -> WebSocket connection
        self.user_to_connection: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        """Establish connection and associate WebSocket with user_id."""
        await websocket.accept()
        self.user_to_connection[user_id] = websocket

    def disconnect(self, websocket: WebSocket, user_id: str):
        """Disconnect the WebSocket and remove the association."""
        if user_id in self.user_to_connection:
            self.user_to_connection.pop(user_id)

    async def send_personal_message(self, json_data: dict, user_id: str):
        """Send a personal message to a user based on their user_id."""
        websocket = self.user_to_connection.get(user_id)
        if websocket:
            message = json.dumps(json_data)  # Convert dictionary to JSON string
            await websocket.send_text(message)
        else:
            print(f"No connection found for user {user_id}")

    async def broadcast(self, message: str):
        """Broadcast message to all connected users."""
        for websocket in self.user_to_connection.values():
            await websocket.send_text(message)

manager = ConnectionManager()
