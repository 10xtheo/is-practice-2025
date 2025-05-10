from fastapi import APIRouter, Depends, HTTPException
from pydantic.networks import EmailStr
from sqlmodel import select
import uuid

from app.api.deps import get_current_active_superuser, CurrentUser, SessionDep
from app.models import (
    Message,
    Category,
    CategoryParticipant,
    CategoryPermission,
    Event,
    EventCategoryLink,
    EventParticipant,
    EventPermission
)
from app.utils import generate_test_email, send_email

router = APIRouter(prefix="/utils", tags=["utils"])


@router.post(
    "/test-email/",
    dependencies=[Depends(get_current_active_superuser)],
    status_code=201,
)
def test_email(email_to: EmailStr) -> Message:
    """
    Test emails.
    """
    email_data = generate_test_email(email_to=email_to)
    send_email(
        email_to=email_to,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="Test email sent")


@router.get("/health-check/")
async def health_check() -> bool:
    return True

def check_category_permissions(
    session: SessionDep,
    current_user: CurrentUser,
    category_id: uuid.UUID,
    required_permission: CategoryPermission
) -> bool:
    """
    Checks category permissions with hierarchy: VIEW < EDIT < MANAGE.
    Superusers and category owners have full access.
    """
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Superuser bypass
    if current_user.is_superuser:
        return True

    # Category owner has full permissions
    if category.owner_id == current_user.id:
        return True

    # Check participant
    participant = session.exec(
        select(CategoryParticipant).where(
            CategoryParticipant.category_id == category.id,
            CategoryParticipant.user_id == current_user.id
        )
    ).first()

    if not participant:
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to access this category"
        )

    # Permission hierarchy logic
    if required_permission == CategoryPermission.VIEW:
        return True  # All participants can view

    elif required_permission == CategoryPermission.EDIT:
        return participant.permissions in [
            CategoryPermission.EDIT,
            CategoryPermission.MANAGE
        ]

    elif required_permission == CategoryPermission.MANAGE:
        return participant.permissions == CategoryPermission.MANAGE

    return False

def check_event_permissions(
    session: SessionDep,
    current_user: CurrentUser,
    event: Event,
    required_permission: EventPermission
) -> bool:
    """
    Checks event permissions with hierarchy: VIEW < EDIT < ORGANIZE.
    Superusers and event creators have full access.
    """
    # Superuser bypass
    if current_user.is_superuser:
        return True

    # Event creator has full permissions
    if event.creator_id == current_user.id:
        return True

    # Check participant
    participant = session.exec(
        select(EventParticipant).where(
            EventParticipant.event_id == event.id,
            EventParticipant.user_id == current_user.id
        )
    ).first()

    if not participant:
        raise HTTPException(status_code=403, detail="Not an event participant")

    # Permission hierarchy logic
    if required_permission == EventPermission.VIEW:
        return True  # All participants can view

    elif required_permission == EventPermission.EDIT:
        return participant.permissions in [
            EventPermission.EDIT,
            EventPermission.ORGANIZE
        ]

    elif required_permission == EventPermission.ORGANIZE:
        return participant.permissions == EventPermission.ORGANIZE

    return False
