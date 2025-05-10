from fastapi import WebSocket, WebSocketDisconnect, status
from ..models import Message, MessageCreate, EventParticipant
from app.api.deps import get_db
from app.websockets.router import websocket_route
from app.websockets.manager import manager
from app.websockets.deps import CurrentUserWS
from app.chat.permissions import is_user_participant_of_event
from sqlmodel import select


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

    participant = db.exec(
        select(EventParticipant).where(
            EventParticipant.event_id == event_id,
            EventParticipant.user_id == user.id
        )
    ).first()


    user_id = user.id

    await manager.connect(websocket, user_id)
    manager.join_event(user_id, event_id)

    try:
        while True:
            data = await websocket.receive_text()

            # BLOCK MESSAGES FROM LISTENERS
            if participant.is_listener:
                error_msg = {
                    "type": "error",
                    "detail": "Listeners cannot send messages"
                }
                await websocket.send_json(error_msg)
                continue  # Skip message processing but keep connection alive

            full_name = user.full_name

            # Create a new message instance based on the new schema
            message = MessageCreate(
                content=data,
                user_id=user_id,
                event_id=event_id,
                full_name=full_name
            )
            # Save message to the database
            db_message = Message(
                content=message.content,
                user_id=message.user_id,
                event_id=message.event_id,
                full_name = message.full_name
            )
            db.add(db_message)
            db.commit()
            db.refresh(db_message)
            # Prepare the message data to send to other users
            message_data = {
                "id": str(db_message.id),  # Convert UUID to string
                "content": db_message.content,
                "user_id": str(db_message.user_id),  # Convert UUID to string
                "event_id": str(db_message.event_id),  # Convert UUID to string
                "timestamp": db_message.timestamp.isoformat(),  # Convert timestamp to ISO format
                "full_name": db_message.full_name,
            }

            await manager.send_message_to_event(event_id, message_data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        manager.leave_event(user_id, event_id)
