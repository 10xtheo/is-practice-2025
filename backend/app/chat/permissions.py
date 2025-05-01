from sqlalchemy.orm import Session
from app.models import EventParticipant

def is_user_participant_of_event(
    db: Session,
    event_id: str,
    user_id: str,
) -> bool:
    """Check if user is a participant of the event."""
    participant = db.query(EventParticipant).filter(
        EventParticipant.event_id == event_id,
        EventParticipant.user_id == user_id
    ).first()

    return participant is not None
