from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import select, func
from typing import List
import uuid

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    EventParticipant,
    EventParticipantCreate,
    EventParticipantPublic,
    EventParticipantsPublic,
    EventParticipantUpdate,
    Message,
    Event,
    User
)

router = APIRouter(prefix="/events/{event_id}/participants", tags=["Event Participants"])

@router.get("/", response_model=EventParticipantsPublic)
def read_event_participants(
    session: SessionDep, 
    current_user: CurrentUser, 
    event_id: uuid.UUID,
    skip: int = 0, 
    limit: int = 100
):
    """
    Get all participants for an event
    """
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Only creator or superuser can see participants
    if not current_user.is_superuser and event.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    count_statement = select(func.count()).where(EventParticipant.event_id == event_id)
    count = session.exec(count_statement).one()
    
    statement = (
        select(EventParticipant)
        .where(EventParticipant.event_id == event_id)
        .offset(skip)
        .limit(limit)
    )
    participants = session.exec(statement).all()

    return EventParticipantsPublic(data=participants, count=count)

@router.post("/", response_model=EventParticipantPublic)
def add_event_participant(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    event_id: uuid.UUID,
    participant_in: EventParticipantCreate
):
    """
    Add a participant to an event
    """
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check permissions
    if not current_user.is_superuser and event.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    user = session.get(User, participant_in.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = session.exec(
        select(EventParticipant)
        .where(EventParticipant.event_id == event_id)
        .where(EventParticipant.user_id == participant_in.user_id)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User is already a participant")

    participant = EventParticipant(
        **participant_in.model_dump(),
        event_id=event_id
    )
    
    session.add(participant)
    session.commit()
    session.refresh(participant)
    
    return participant

@router.put("/{user_id}", response_model=EventParticipantPublic)
def update_event_participant(
    *,
    session: SessionDep,
    current_user: CurrentUser ,
    event_id: uuid.UUID,
    user_id: uuid.UUID,  # Change participant_id to user_id
    participant_in: EventParticipantUpdate
):
    """
    Update an event participant's permissions based on user_id
    """
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if not current_user.is_superuser and event.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Fetch the participant based on user_id instead of participant_id
    participant = session.query(EventParticipant).filter_by(user_id=user_id, event_id=event_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    update_data = participant_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(participant, field, value)
    
    session.add(participant)
    session.commit()
    session.refresh(participant)
    
    return participant

@router.delete("/{user_id}")
def remove_event_participant(
    session: SessionDep,
    current_user: CurrentUser ,
    event_id: uuid.UUID,
    user_id: uuid.UUID,  # Change participant_id to user_id
) -> Message:
    """
    Remove a participant from an event based on user_id
    """
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if not current_user.is_superuser and event.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Fetch the participant based on user_id instead of participant_id
    participant = session.query(EventParticipant).filter_by(user_id=user_id, event_id=event_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    session.delete(participant)
    session.commit()
    
    return Message(message="Participant removed successfully")
