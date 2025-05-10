import asyncio
import datetime
from uuid import UUID
from app.api.deps import get_db
from app.notifications.events_check import (
    generate_notifications_from_upcoming_events,
    get_upcoming_notifications,
    clean_old_notifications
)
from app.websockets.manager import manager

async def send_scheduled_notifications_loop():
    while True:
        db = next(get_db())
        generate_notifications_from_upcoming_events(db)
        notifications = get_upcoming_notifications(db)
        for user_id, json_data in notifications:
            try:
                await manager.send_personal_message(json_data, UUID(str(user_id)))
            except Exception as e:
                print(f"Failed to send notification to {user_id}: {e}")
        clean_old_notifications(db)
        db.close()
        await asyncio.sleep(30)
