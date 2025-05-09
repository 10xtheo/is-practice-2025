from fastapi import APIRouter, HTTPException
from sqlmodel import select, func
from typing import List, Any
import uuid

from app.api.deps import CurrentUser, SessionDep
from app.api.routes.utils import check_category_permissions
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
    User,
    CategoryPermission
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
    if not check_category_permissions(session, current_user, category_id, CategoryPermission.VIEW):
        raise HTTPException(status_code=403, detail="Not enough permissions to view participants")

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
    current_user: CurrentUser,
    category_id: uuid.UUID,
    participant_in: CategoryParticipantCreate
):
    """
    Add a participant to a category (without adding to category's events).
    """
    # Verify category exists and user has manage permissions
    if check_category_permissions(session, current_user, category_id, CategoryPermission.VIEW):
        raise HTTPException(status_code=403, detail="Not enough permissions to add participants")

    # Verify target user exists
    user = session.get(User, participant_in.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if participant already exists
    existing = session.exec(
        select(CategoryParticipant)
        .where(CategoryParticipant.category_id == category_id)
        .where(CategoryParticipant.user_id == participant_in.user_id)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User is already a participant")

    # Create the new category participant
    participant = CategoryParticipant(
        **participant_in.model_dump(),
        category_id=category_id
    )
    
    session.add(participant)
    session.commit()
    session.refresh(participant)

    return participant

@router.put("/{user_id}", response_model=CategoryParticipantPublic)
def update_category_participant(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    category_id: uuid.UUID,
    user_id: uuid.UUID,
    participant_in: CategoryParticipantUpdate
):
    """
    Update a category participant's permissions based on user_id
    """
    # Verify category exists and user has manage permissions
    if not check_category_permissions(session, current_user, category_id, CategoryPermission.MANAGE):
        raise HTTPException(status_code=403, detail="Not enough permissions to update participants")

    # Fetch the participant based on user_id
    participant = session.exec(
        select(CategoryParticipant).where(
            CategoryParticipant.category_id == category_id,
            CategoryParticipant.user_id == user_id
        )
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    update_data = participant_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(participant, field, value)
    
    session.add(participant)
    session.commit()
    session.refresh(participant)
    
    return participant

@router.delete("/{user_id}", response_model=Message)
def remove_category_participant(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    category_id: uuid.UUID,
    user_id: uuid.UUID
) -> Any:
    """
    Remove a participant from a category based on user_id (without removing them from category's events).
    """
    # Verify category exists and user has manage permissions
    if not check_category_permissions(session, current_user, category_id, CategoryPermission.MANAGE):
        raise HTTPException(status_code=403, detail="Not enough permissions to remove participants")

    # Fetch the participant based on user_id
    participant = session.exec(
        select(CategoryParticipant).where(
            CategoryParticipant.category_id == category_id,
            CategoryParticipant.user_id == user_id
        )
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    # Delete the participant from the category
    session.delete(participant)
    session.commit()

    return Message(message="Participant removed successfully from category")
