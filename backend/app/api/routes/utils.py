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
    Проверяет права доступа к категории.
    """
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Суперпользователь имеет все права
    if current_user.is_superuser:
        return True

    # Владелец категории имеет все права
    if category.owner_id == current_user.id:
        return True

    # Проверяем права участника
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

    # Проверяем уровень прав
    if required_permission == CategoryPermission.VIEW:
        return True
    elif required_permission == CategoryPermission.EDIT:
        return participant.permissions in [CategoryPermission.EDIT, CategoryPermission.MANAGE]
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
    Проверяет права доступа к событию.
    """
    # Суперпользователь имеет все права
    if current_user.is_superuser:
        return True

    # Проверяем права на категорию
    category_link = session.exec(
        select(EventCategoryLink).where(EventCategoryLink.event_id == event.id)
    ).first()
    if not category_link:
        raise HTTPException(status_code=404, detail="Event category not found")

    # Проверяем права на категорию
    if not check_category_permissions(session, current_user, category_link.category_id, CategoryPermission.VIEW):
        return False

    # Если нужно только просмотр, достаточно прав на категорию
    if required_permission == EventPermission.VIEW:
        return True

    # Проверяем права участника события
    participant = session.exec(
        select(EventParticipant).where(
            EventParticipant.event_id == event.id,
            EventParticipant.user_id == current_user.id
        )
    ).first()

    # Если нет прав на категорию EDIT или MANAGE, проверяем права участника
    if not check_category_permissions(session, current_user, category_link.category_id, CategoryPermission.EDIT):
        if not participant:
            return False
        if required_permission == EventPermission.EDIT:
            # Для EDIT нужно быть создателем события
            return participant.is_creator
        if required_permission == EventPermission.ORGANIZE:
            # Для ORGANIZE нужно быть создателем события или иметь права ORGANIZE
            return participant.is_creator or participant.permissions == EventPermission.ORGANIZE

    # Если есть права на категорию EDIT или MANAGE
    if check_category_permissions(session, current_user, category_link.category_id, CategoryPermission.EDIT):
        if required_permission == EventPermission.EDIT:
            # Для EDIT нужно быть создателем события или иметь права MANAGE на категорию
            return participant.is_creator or check_category_permissions(session, current_user, category_link.category_id, CategoryPermission.MANAGE)
        if required_permission == EventPermission.ORGANIZE:
            # Для ORGANIZE достаточно иметь права ORGANIZE на событие или быть создателем
            return (participant and (participant.is_creator or participant.permissions == EventPermission.ORGANIZE))

    return False
