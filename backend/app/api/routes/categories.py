import uuid
from typing import Any, List
from sqlalchemy import or_, and_, func
from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.api.routes.utils import check_category_permissions
from app.models import (
    Category,
    CategoryCreate,
    CategoryPublic,
    CategoriesPublic,
    CategoryUpdate,
    Message,
    Event,
    EventCategoryLink,
    CategoryParticipant,
    CategoryPermission,
    User,
    EventParticipant
)

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=CategoriesPublic)
def read_categories(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve categories.
    """
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Category)
        count = session.exec(count_statement).one()
        statement = select(Category).offset(skip).limit(limit)
        categories = session.exec(statement).all()
    else:
        # Count categories where the user is either the owner or a participant
        count_statement = (
            select(func.count(func.distinct(Category.id)))
            .select_from(Category)
            .outerjoin(CategoryParticipant)
            .where(
                or_(
                    Category.owner_id == current_user.id,
                    CategoryParticipant.user_id == current_user.id
                )
            )
        )
        count = session.exec(count_statement).one()

        # Select categories where the user is either the owner or a participant
        statement = (
            select(Category)
            .distinct()
            .outerjoin(CategoryParticipant)
            .where(
                or_(
                    Category.owner_id == current_user.id,
                    CategoryParticipant.user_id == current_user.id
                )
            )
            .offset(skip)
            .limit(limit)
        )
        categories = session.exec(statement).all()

    return CategoriesPublic(data=categories, count=count)

@router.get("/{id}", response_model=CategoryPublic)
def read_category(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get category by ID.
    """
    category = session.get(Category, id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if not check_category_permissions(session, current_user, category.id, CategoryPermission.VIEW):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return category

@router.post("/", response_model=CategoryPublic)
def create_category(
    *, session: SessionDep, current_user: CurrentUser, category_in: CategoryCreate, event_ids: List[uuid.UUID] = []
) -> Any:
    """
    Create new category and link it to events.
    """
    try:
        # Создаем категорию без participants
        category_data = category_in.model_dump(exclude={"participants"})
        category = Category.model_validate(category_data, update={"owner_id": current_user.id})
        session.add(category)
        session.flush()

        # Link events to the category
        for event_id in event_ids:
            event = session.get(Event, event_id)
            if not event:
                raise HTTPException(status_code=404, detail=f"Event with ID {event_id} not found")
            link = EventCategoryLink(event_id=event_id, category_id=category.id)
            session.add(link)

        # Create a new CategoryParticipant for the creator with MANAGE permissions
        creator_participant = CategoryParticipant(
            user_id=current_user.id,
            category_id=category.id,
            is_creator=True,
            permissions=CategoryPermission.MANAGE
        )
        session.add(creator_participant)

        # Добавляем участников, если они указаны
        if category_in.participants:
            for participant in category_in.participants:
                if participant.user_id == current_user.id:
                    continue

                # Проверяем существование пользователя
                user = session.get(User, participant.user_id)
                if not user:
                    raise HTTPException(
                        status_code=404,
                        detail=f"User with ID {participant.user_id} not found"
                    )

                # Создаем участника категории
                category_participant = CategoryParticipant(
                    category_id=category.id,
                    user_id=participant.user_id,
                    is_creator=participant.is_creator,
                    permissions=participant.permissions
                )
                session.add(category_participant)

        session.commit()
        session.refresh(category)
        return category

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create category: {str(e)}"
        )

@router.put("/{id}", response_model=CategoryPublic)
def update_category(
    *,
    session: SessionDep,
    current_user: CurrentUser ,
    id: uuid.UUID,
    category_in: CategoryUpdate,
    event_ids: List[uuid.UUID] = None  # Change to None to make it optional
) -> Any:
    """
    Update a category and its linked events.
    """
    category = session.get(Category, id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if check_category_permissions(session, current_user, category.id, CategoryPermission.VIEW):
        raise HTTPException(status_code=403, detail="Not enough permissions to update this category")

    # Update category fields
    update_dict = category_in.model_dump(exclude_unset=True)
    category.sqlmodel_update(update_dict)

    # Update event links only if event_ids is provided
    if event_ids is not None:
        # Remove existing links
        existing_links = session.exec(select(EventCategoryLink).where(EventCategoryLink.category_id == category.id)).all()
        for link in existing_links:
            session.delete(link)

        # Add new links
        for event_id in event_ids:
            event = session.get(Event, event_id)
            if not event:
                raise HTTPException(status_code=404, detail=f"Event with ID {event_id} not found")
            
            # Check if the current user is a participant of the event
            participant = session.exec(
                select(EventParticipant).where(
                    EventParticipant.event_id == event_id,
                    EventParticipant.user_id == current_user.id
                )
            ).first()
            if not participant:
                raise HTTPException(status_code=403, detail=f"User  is not a participant of event with ID {event_id}")

            new_link = EventCategoryLink(event_id=event_id, category_id=category.id)
            session.add(new_link)

    session.add(category)
    session.commit()
    session.refresh(category)
    return category


@router.delete("/{id}", response_model=Message)
def delete_category(
    *,
    session: SessionDep,
    current_user: CurrentUser ,
    id: uuid.UUID
) -> Any:
    """
    Delete a category.
    """
    category = session.get(Category, id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if not check_category_permissions(session, current_user, category.id, CategoryPermission.MANAGE):
        raise HTTPException(status_code=403, detail="Not enough permissions to delete this category")

    # Delete related participants
    participants = session.exec(
        select(CategoryParticipant).where(CategoryParticipant.category_id == id)
    ).all()
    
    for participant in participants:
        session.delete(participant)

    # Now delete the category
    session.delete(category)
    session.commit()
    
    return Message(message="Category deleted successfully")
