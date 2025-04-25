from datetime import datetime, timedelta
from sqlmodel import Session, select, delete
from app.models import Event, EventParticipant, Notification, User

NOTIFY_DELTAS = [0, 1, 2, 3]  # minutes before the event to notify

def generate_notifications_from_upcoming_events(session: Session):
    now = datetime.now()
    upcoming_window = now + timedelta(minutes=max(NOTIFY_DELTAS), seconds=30)

    events = session.exec(
        select(Event).where(Event.start <= upcoming_window)
    ).all()

    for event in events:
        participants = session.exec(
            select(EventParticipant).where(EventParticipant.event_id == event.id)
        ).all()

        for delta in NOTIFY_DELTAS:
            send_time = event.start - timedelta(minutes=delta)

            # Skip if send_time already passed
            if send_time < now:
                continue

            for participant in participants:
                exists = session.exec(
                    select(Notification).where(
                        Notification.user_id == participant.user_id,
                        Notification.event_id == event.id,
                        Notification.send_at == send_time,
                    )
                ).first()

                if not exists:
                    notification = Notification(
                        user_id=participant.user_id,
                        event_id=event.id,
                        message=f"🔔 Reminder: '{event.title}' at {event.start.strftime('%H:%M')}",
                        send_at=send_time,
                        sent=False
                    )
                    session.add(notification)
    session.commit()


def get_upcoming_notifications(session: Session):
    now = datetime.now()
    notifications = session.exec(
        select(Notification).where(
            Notification.sent == False,
            Notification.send_at <= now
        )
    ).all()

    full_notifications = []

    for notif in notifications:
        user = session.exec(select(User).where(User.id == notif.user_id)).first()
        user_fullname = user.full_name if user else "Unknown User"

        event = session.exec(select(Event).where(Event.id == notif.event_id)).first()
        event_title = event.title if event else "Unknown Event"

        time_diff = event.start - notif.send_at
        remaining_minutes = max(0, int(time_diff.total_seconds() // 60))

        if remaining_minutes == 0:
            message = f"Event '{event_title}' started, {user_fullname}!"
        else:
            message = f"Event '{event_title}' coming in {remaining_minutes} minutes, {user_fullname}!"

        json_data = {
            "message": message,
            "event_id": str(notif.event_id)
        }

        notif.sent = True

        full_notifications.append((notif.user_id, json_data))

    session.commit()
    return full_notifications


def clean_old_notifications(session: Session):
    cutoff = datetime.now() - timedelta(days=1)
    session.exec(
        delete(Notification).where(
            Notification.sent == True,
            Notification.send_at < cutoff
        )
    )
    session.commit()
