from fastapi import WebSocket, WebSocketDisconnect
from app.websockets.router import websocket_route
from app.websockets.manager import manager
from app.websockets.deps import CurrentUserWS  # <-- import the dep


@websocket_route("/ws/echo")
async def echo_ws(websocket: WebSocket, user: CurrentUserWS):
    """WebSocket for echoing messages with the user's ID."""
    user_id = user.id
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"{user.full_name} says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)


@websocket_route("/ws/hello")
async def hello_ws(websocket: WebSocket, user: CurrentUserWS):
    """WebSocket for broadcasting a hello message to all users."""
    user_id = user.id
    await manager.connect(websocket, user_id)
    try:
        while True:
            _ = await websocket.receive_text()
            await manager.broadcast(f"👋 Hello from {user.full_name} to all connected users!")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
