import asyncio
from app.api.deps import get_db
from app.notifications.events_check import get_upcoming_notifications
from app.websockets.manager import manager
from uuid import UUID
async def send_scheduled_notifications_loop():
    while True:
        db = next(get_db())
        notifications = get_upcoming_notifications(db)

        for notification in notifications:
            user_id = str(notification["user_id"])
            message = f"🔔 Notification for {notification['event_title']} at {notification['event_time']}"
            await manager.send_personal_message(message, UUID(user_id))

        notifications.clear()
 
        db.close()        
        await asyncio.sleep(30)
