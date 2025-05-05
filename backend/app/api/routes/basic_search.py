from fastapi import APIRouter, Query
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    User, UserPublic,
    Event, EventPublic,
    Category, CategoryPublic,
    CategoryParticipant,
    EventParticipant,
    BasicSearchResponse
)

router = APIRouter()

@router.get("/basic-search", response_model=BasicSearchResponse, tags=["basic-search"])
def basic_search(
    session: SessionDep,
    current_user: CurrentUser,
    q: str = Query(..., description="Search query string"),
):
    """
    Basic search on users' full names, event titles, and category titles.
    Returns matching lists of UserPublic, EventPublic, and CategoryPublic objects 
    containing the query string (case-insensitive).
    """

    # Trim the query string and check if it's empty
    trimmed_query = q.strip()
    if not trimmed_query:
        return BasicSearchResponse(users=[], events=[], categories=[])

    search_term = f"%{trimmed_query.lower()}%"

    # Search users by full_name
    users_stmt = select(User).where(User.full_name.ilike(search_term))
    user_results = session.exec(users_stmt).all()
    public_users = [UserPublic.from_orm(user) for user in user_results]

    # Search categories the user is permitted to view
    if current_user.is_superuser:
        categories_stmt = select(Category).where(Category.title.ilike(search_term))
        category_results = session.exec(categories_stmt).all()
    else:
        allowed_category_ids = session.exec(
            select(Category.id).join(CategoryParticipant).where(
                (Category.owner_id == current_user.id) |
                (CategoryParticipant.user_id == current_user.id)
            )
        ).all()

        if allowed_category_ids:
            categories_stmt = (
                select(Category)
                .where(
                    Category.id.in_(allowed_category_ids),
                    Category.title.ilike(search_term)
                )
            )
            category_results = session.exec(categories_stmt).all()
        else:
            category_results = []
    
    public_categories = [CategoryPublic.from_orm(cat) for cat in category_results]

    # Search events the user is permitted to view
    if current_user.is_superuser:
        events_stmt = select(Event).where(Event.title.ilike(search_term))
        event_results = session.exec(events_stmt).all()
    else:
        # Only search events where the user is a participant
        participant_events_stmt = (
            select(Event)
            .join(EventParticipant)
            .where(
                EventParticipant.user_id == current_user.id,
                Event.title.ilike(search_term)
            )
        )
        event_results = session.exec(participant_events_stmt).all()
    
    public_events = [EventPublic.from_orm(event) for event in event_results]

    return BasicSearchResponse(
        users=public_users,
        events=public_events,
        categories=public_categories,
    )
