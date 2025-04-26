from fastapi import WebSocket, WebSocketDisconnect, status
from app.api.deps import get_db
from app.websockets.router import websocket_route
from app.websockets.manager import manager
from app.websockets.deps import CurrentUserWS
from app.chat.permissions import is_user_participant_of_event

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


@websocket_route("/ws/event/{event_id}")
async def event_chat_ws(websocket: WebSocket, user: CurrentUserWS, event_id: str):
    """WebSocket for chatting inside a specific event."""
    db = next(get_db())
    if not is_user_participant_of_event(db, event_id, user.id):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = user.id

    await manager.connect(websocket, user_id)
    manager.join_event(user_id, event_id)

    try:
        while True:
            data = await websocket.receive_text()
            message_data = {
            "message": data,
            "user_id": str(user.id),
            "event_id": event_id
            }
            await manager.send_message_to_event(event_id, message_data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        manager.leave_event(user_id, event_id)
