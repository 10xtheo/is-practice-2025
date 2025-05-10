from sqlalchemy.orm import Session
from sqlalchemy.exc import DataError
from fastapi import HTTPException
from app.models import EventParticipant, User, Event

def is_user_participant_of_event(
    db: Session,
    event_id: str,
    user_id: str,
) -> bool:
    """Check if user is a participant of the event or is a superuser."""
    
    try:
        # Check if the user is a superuser
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.is_superuser:
            return True

        # Check if the event exists
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

        # Check if the user is a participant of the event
        participant = db.query(EventParticipant).filter(
            EventParticipant.event_id == event_id,
            EventParticipant.user_id == user_id
        ).first()

        return participant is not None

    except DataError as e:
        raise HTTPException(status_code=400)
