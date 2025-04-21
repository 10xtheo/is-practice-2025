import uuid
from typing import Any, List

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import func, select

from app.api.deps import CurrentUser , SessionDep
from app.models import (
    Category,
    CategoryCreate,
    CategoryPublic,
    CategoriesPublic,
    CategoryUpdate,
    Message,
    Event,
    EventCategoryLink,
    CategoryParticipant
)

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=CategoriesPublic)
def read_categories(
    session: SessionDep, current_user: CurrentUser , skip: int = 0, limit: int = 100
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
            select(func.count())
            .select_from(Category)
            .join(CategoryParticipant)
            .where((Category.owner_id == current_user.id) | (CategoryParticipant.user_id == current_user.id))
        )
        count = session.exec(count_statement).one()

        # Select categories where the user is either the owner or a participant
        statement = (
            select(Category)
            .join(CategoryParticipant)
            .where((Category.owner_id == current_user.id) | (CategoryParticipant.user_id == current_user.id))
            .offset(skip)
            .limit(limit)
        )
        categories = session.exec(statement).all()

    return CategoriesPublic(data=categories, count=count)

@router.get("/{id}", response_model=CategoryPublic)
def read_category(session: SessionDep, current_user: CurrentUser , id: uuid.UUID) -> Any:
    """
    Get category by ID.
    """
    category = session.get(Category, id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check if the user is the owner or a participant
    is_owner = category.owner_id == current_user.id
    is_participant = session.exec(
        select(CategoryParticipant).where(
            CategoryParticipant.category_id == category.id,
            CategoryParticipant.user_id == current_user.id
        )
    ).first() is not None

    if not current_user.is_superuser and not (is_owner or is_participant):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return category

@router.post("/", response_model=CategoryPublic)
def create_category(
    *, session: SessionDep, current_user: CurrentUser , category_in: CategoryCreate, event_ids: List[uuid.UUID] = []
) -> Any:
    """
    Create new category and link it to events.
    """
    category = Category.model_validate(category_in, update={"owner_id": current_user.id})
    session.add(category)
    session.commit()
    session.refresh(category)

    # Link events to the category
    for event_id in event_ids:
        event = session.get(Event, event_id)
        if not event:
            raise HTTPException(status_code=404, detail=f"Event with ID {event_id} not found")
        link = EventCategoryLink(event_id=event_id, category_id=category.id)
        session.add(link)

    # Create a new CategoryParticipant
    category_participant = CategoryParticipant(user_id=current_user.id, category_id=category.id, is_creator=True)
    session.add(category_participant)

    session.commit()  # Commit the links to the database
    return category

@router.put("/{id}", response_model=CategoryPublic)
def update_category(
    *,
    session: SessionDep,
    current_user: CurrentUser ,
    id: uuid.UUID,
    category_in: CategoryUpdate,
    event_ids: List[uuid.UUID] = []
) -> Any:
    """
    Update a category and its linked events.
    """
    category = session.get(Category, id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if not current_user.is_superuser and (category.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")

    # Update category fields
    update_dict = category_in.model_dump(exclude_unset=True)
    category.sqlmodel_update(update_dict)

    # Update event links
    # Remove existing links
    existing_links = session.exec(select(EventCategoryLink).where(EventCategoryLink.category_id == category.id)).all()
    for link in existing_links:
        session.delete(link)

    # Add new links
    for event_id in event_ids:
        event = session.get(Event, event_id)
        if not event:
            raise HTTPException(status_code=404, detail=f"Event with ID {event_id} not found")
        new_link = EventCategoryLink(event_id=event_id, category_id=category.id)
        session.add(new_link)

    session.add(category)
    session.commit()
    session.refresh(category)
    return category

@router.delete("/{id}")
def delete_category(
    session: SessionDep, current_user: CurrentUser , id: uuid.UUID
) -> Message:
    """
    Delete a category.
    """
    category = session.get(Category, id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    if not current_user.is_superuser and (category.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(category)
    session.commit()
    return Message(message="Category deleted successfully")
