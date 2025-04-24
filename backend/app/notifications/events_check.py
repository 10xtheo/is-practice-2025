from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.models import Event, EventParticipant

def get_upcoming_notifications(session: Session):
    now = datetime.now()
    time_deltas = [1, 2] # To notify about event in 1 and 2 minutes before it starts
    result = []

    for delta in time_deltas:
        target_time = now + timedelta(minutes=delta)
        events = session.exec(
            select(Event).where(
                Event.start.between(target_time - timedelta(seconds=30), target_time + timedelta(seconds=30))
            )
        ).all()

        for event in events:
            participants = session.exec(
                select(EventParticipant).where(EventParticipant.event_id == event.id)
            ).all()

            for participant in participants:
                result.append({
                    "user_id": participant.user_id,
                    "event_id": event.id,
                    "event_title": event.title,
                    "event_time": event.start,
                    "notify_in_minutes": delta,
                })

    return result
