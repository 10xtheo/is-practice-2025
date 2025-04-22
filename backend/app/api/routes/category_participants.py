from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import select, func
from typing import List
import uuid

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    CategoryParticipant,
    CategoryParticipantCreate,
    CategoryParticipantPublic,
    CategoryParticipantsPublic,
    CategoryParticipantUpdate,
    EventCategoryLink,
    EventParticipant,
    EventPermission,
    Message,
    Category,
    User
)

router = APIRouter(prefix="/categories/{category_id}/participants", tags=["Category Participants"])

@router.get("/", response_model=CategoryParticipantsPublic)
def read_category_participants(
    session: SessionDep, 
    current_user: CurrentUser, 
    category_id: uuid.UUID,
    skip: int = 0, 
    limit: int = 100
):
    """
    Get all participants for a category
    """
    # Verify category exists and user has access
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Only owner or superuser can see participants
    if not current_user.is_superuser and category.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Get count and participants
    count_statement = select(func.count()).where(CategoryParticipant.category_id == category_id)
    count = session.exec(count_statement).one()
    
    statement = (
        select(CategoryParticipant)
        .where(CategoryParticipant.category_id == category_id)
        .offset(skip)
        .limit(limit)
    )
    participants = session.exec(statement).all()

    return CategoryParticipantsPublic(data=participants, count=count)

@router.post("/", response_model=CategoryParticipantPublic)
def add_category_participant(
    *,
    session: SessionDep,
    current_user: CurrentUser ,
    category_id: uuid.UUID,
    participant_in: CategoryParticipantCreate
):
    """
    Add a participant to a category and also add them to all associated events.
    """
    # Verify category exists and user has manage permissions
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if current user is owner or superuser
    if not current_user.is_superuser and category.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Verify target user exists
    user = session.get(User, participant_in.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User  not found")

    # Check if participant already exists
    existing = session.exec(
        select(CategoryParticipant)
        .where(CategoryParticipant.category_id == category_id)
        .where(CategoryParticipant.user_id == participant_in.user_id)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User  is already a participant")

    # Create the new category participant
    participant = CategoryParticipant(
        **participant_in.model_dump(),
        category_id=category_id
    )
    
    session.add(participant)
    session.commit()
    session.refresh(participant)

    # Now add the user to all events associated with the category
    event_links = session.exec(
        select(EventCategoryLink)
        .where(EventCategoryLink.category_id == category_id)
    ).all()

    for link in event_links:
        event_participant = EventParticipant(
            user_id=participant_in.user_id,
            event_id=link.event_id,
            permissions=EventPermission.VIEW  # Set default permissions as needed
        )
        session.add(event_participant)

    session.commit()  # Commit the new event participants to the database

    return participant

@router.put("/{user_id}", response_model=CategoryParticipantPublic)
def update_category_participant(
    *,
    session: SessionDep,
    current_user: CurrentUser ,
    category_id: uuid.UUID,
    user_id: uuid.UUID,  # Change participant_id to user_id
    participant_in: CategoryParticipantUpdate
):
    """
    Update a category participant's permissions based on user_id
    """
    # Verify category exists
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check permissions - only owner/superuser can modify participants
    if not current_user.is_superuser and category.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Fetch the participant based on user_id instead of participant_id
    participant = session.query(CategoryParticipant).filter_by(user_id=user_id, category_id=category_id).first()
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
def remove_category_participant(
    session: SessionDep,
    current_user: CurrentUser  ,
    category_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Message:
    """
    Remove a participant from a category based on user_id and also remove them from all associated events.
    """
    # Verify category exists
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check permissions
    if not current_user.is_superuser and category.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Fetch the participant based on user_id
    participant = session.query(CategoryParticipant).filter_by(user_id=user_id, category_id=category_id).first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    # Delete the participant from the category
    session.delete(participant)

    # Now remove the user from all events associated with the category
    event_links = session.exec(
        select(EventCategoryLink)
        .where(EventCategoryLink.category_id == category_id)
    ).all()

    for link in event_links:
        # Delete the user from the event participants
        event_participant = session.exec(
            select(EventParticipant)
            .where(EventParticipant.event_id == link.event_id)
            .where(EventParticipant.user_id == user_id)
        ).first()
        
        if event_participant:
            session.delete(event_participant)

    session.commit()  # Commit the changes to the database

    return Message(message="Participant removed successfully from category and all associated events")
