from fastapi import WebSocket, WebSocketDisconnect
from app.websockets.manager import manager


async def echo_ws(websocket: WebSocket, user_id: str):
    """Echo WebSocket endpoint that sends messages back to the user."""
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)


async def hello_ws(websocket: WebSocket, user_id: str):
    """Hello WebSocket endpoint that broadcasts messages to all users."""
    await manager.connect(websocket, user_id)
    try:
        while True:
            _ = await websocket.receive_text()
            await manager.broadcast(f"👋 Hello from {user_id} to all connected users!")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
