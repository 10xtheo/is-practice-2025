from fastapi import APIRouter, Query
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models import User, Event, Category, CategoryParticipant, EventParticipant, BasicSearchResponse

router = APIRouter()

@router.get("/basic-search", response_model=BasicSearchResponse, tags=["basic-search"])
def basic_search(
    session: SessionDep,
    current_user: CurrentUser,
    q: str = Query(..., description="Search query string"),
):
    """
    Basic search on users' full names, event titles, and category titles.

    Returns matching lists of strings containing the query string (case-insensitive).
    """

    # Trim the query string and check if it's empty
    trimmed_query = q.strip()
    if not trimmed_query:
        return BasicSearchResponse(users=[], events=[], categories=[])

    search_term = f"%{trimmed_query.lower()}%"

    # Search users by full_name
    users_stmt = select(User.full_name).where(User.full_name.ilike(search_term))
    user_fullnames = session.exec(users_stmt).all()

    # Search categories the user is permitted to view
    if current_user.is_superuser:
        categories_stmt = select(Category.title).where(Category.title.ilike(search_term))
        category_titles = session.exec(categories_stmt).all()
    else:
        allowed_category_ids = session.exec(
            select(Category.id).join(CategoryParticipant).where(
                (Category.owner_id == current_user.id) |
                (CategoryParticipant.user_id == current_user.id)
            )
        ).all()

        if allowed_category_ids:
            categories_stmt = (
                select(Category.title)
                .where(
                    Category.id.in_(allowed_category_ids),
                    Category.title.ilike(search_term)
                )
            )
            category_titles = session.exec(categories_stmt).all()
        else:
            category_titles = []

    # Search events the user is permitted to view
    if current_user.is_superuser:
        events_stmt = select(Event.title).where(Event.title.ilike(search_term))
        event_titles = session.exec(events_stmt).all()
    else:
        # Only search events where the user is a participant
        participant_events_stmt = (
            select(Event.title)
            .join(EventParticipant)
            .where(
                EventParticipant.user_id == current_user.id,
                Event.title.ilike(search_term)
            )
        )
        event_titles = session.exec(participant_events_stmt).all()

    # Remove duplicates while preserving order
    event_titles = list(dict.fromkeys(event_titles))

    return BasicSearchResponse(
        users=user_fullnames,
        events=event_titles,
        categories=category_titles,
    )
