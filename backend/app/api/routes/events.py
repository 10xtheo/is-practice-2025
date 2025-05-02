import uuid
from typing import Any, List, Optional
from sqlalchemy import or_, and_, func, case
from fastapi import APIRouter, HTTPException
from sqlmodel import func, select
from datetime import datetime, timedelta, timezone

from app.api.deps import CurrentUser, SessionDep
from app.api.routes.utils import check_category_permissions, check_event_permissions
from app.models import (
    Event, EventCreate, EventPublic, EventsPublic, EventUpdate, Message,
    EventParticipant, EventPermission, EventParticipantsPublic,
    CategoryParticipant, CategoryPermission, EventCategoryLink, User, Category
)

router = APIRouter(prefix="/events", tags=["events"])

def normalize_datetime(dt: datetime) -> datetime:
    """
    Convert datetime to UTC if it has timezone info, otherwise assume it's UTC.
    """
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

def get_event_occurrences_in_range(event: Event, start_date: datetime, end_date: datetime) -> bool:
    """
    Check if an event or any of its recurrences falls within the given time range.
    Returns True if the event or any of its recurrences is within the range.
    """
    # Normalize all datetimes to UTC
    start_date = normalize_datetime(start_date)
    end_date = normalize_datetime(end_date)
    event_start = normalize_datetime(event.start)
    event_end = normalize_datetime(event.end)
    
    # If event has no repeat step, just check if it's within the range
    if event.repeat_step == 0:
        return event_start <= end_date and event_end >= start_date
    
    # Calculate the duration of the event
    event_duration = event_end - event_start
    
    # Calculate how many days we need to check
    days_to_check = (end_date - event_start).days
    
    # Check each occurrence
    current_start = event_start
    repeats_checked = 0
    
    while current_start <= end_date:
        current_end = current_start + event_duration
        
        # Check if this occurrence overlaps with our range
        if current_start <= end_date and current_end >= start_date:
            return True
            
        # Move to next occurrence
        current_start += timedelta(days=event.repeat_step)
        repeats_checked += 1
        
        # Stop if we've reached max repeats
        if event.max_repeats_count > 0 and repeats_checked >= event.max_repeats_count:
            break
    
    return False

@router.get("/", response_model=EventsPublic)
def read_events(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    user_id: Optional[uuid.UUID] = None
) -> Any:
    """
    Retrieve events with optional time range filtering and optional user filtering.
    Takes into account recurring events and their repetitions.
    If only start_date is provided, returns all events starting from that date.
    """
    # Normalize start_date if provided
    if start_date is not None:
        start_date = normalize_datetime(start_date)
    
    # Normalize end_date if provided
    if end_date is not None:
        end_date = normalize_datetime(end_date)
        # Verify time range validity if both dates are provided
        if start_date is not None and start_date >= end_date:
            raise HTTPException(
                status_code=400,
                detail="Start date must be before end date"
            )

    if current_user.is_superuser:
        # Base query for superuser
        base_query = select(Event)
        count_query = select(func.count()).select_from(Event)
        
        # Add user filter if provided
        if user_id is not None:
            base_query = base_query.join(EventParticipant).where(EventParticipant.user_id == user_id)
            count_query = count_query.join(EventParticipant).where(EventParticipant.user_id == user_id)
        
        # Add time range filters if provided
        if start_date is not None:
            if end_date is not None:
                # Both dates provided - check for events in range
                base_query = base_query.where(
                    or_(
                        and_(Event.start <= end_date, Event.end >= start_date),
                        and_(Event.repeat_step > 0, Event.start <= end_date)
                    )
                )
                count_query = count_query.where(
                    or_(
                        and_(Event.start <= end_date, Event.end >= start_date),
                        and_(Event.repeat_step > 0, Event.start <= end_date)
                    )
                )
            else:
                # Only start_date provided - get all events from start_date
                base_query = base_query.where(
                    or_(
                        Event.start >= start_date,
                        and_(Event.repeat_step > 0, Event.start <= start_date)
                    )
                )
                count_query = count_query.where(
                    or_(
                        Event.start >= start_date,
                        and_(Event.repeat_step > 0, Event.start <= start_date)
                    )
                )
            
        count = session.exec(count_query).one()
        statement = base_query.offset(skip).limit(limit)
        events = session.exec(statement).all()
        
        # Filter events based on their occurrences
        if start_date is not None:
            if end_date is not None:
                events = [event for event in events if get_event_occurrences_in_range(event, start_date, end_date)]
            else:
                # For start_date only, check if event or any of its recurrences starts after start_date
                events = [event for event in events if get_event_occurrences_in_range(event, start_date, datetime.max.replace(tzinfo=timezone.utc))]
            count = len(events)
    else:
        # Get categories user has access to
        accessible_categories = session.exec(
            select(Category.id).join(CategoryParticipant).where(
                or_(
                    Category.owner_id == current_user.id,
                    CategoryParticipant.user_id == current_user.id
                )
            )
        ).all()

        # Base query for regular user
        base_query = (
            select(Event)
            .join(EventCategoryLink)
            .where(EventCategoryLink.category_id.in_(accessible_categories))
        )
        count_query = (
            select(func.count())
            .select_from(Event)
            .join(EventCategoryLink)
            .where(EventCategoryLink.category_id.in_(accessible_categories))
        )
        
        # Add user filter if provided
        if user_id is not None:
            base_query = base_query.join(EventParticipant).where(EventParticipant.user_id == user_id)
            count_query = count_query.join(EventParticipant).where(EventParticipant.user_id == user_id)
        
        # Add time range filters if provided
        if start_date is not None:
            if end_date is not None:
                # Both dates provided - check for events in range
                base_query = base_query.where(
                    or_(
                        and_(Event.start <= end_date, Event.end >= start_date),
                        and_(Event.repeat_step > 0, Event.start <= end_date)
                    )
                )
                count_query = count_query.where(
                    or_(
                        and_(Event.start <= end_date, Event.end >= start_date),
                        and_(Event.repeat_step > 0, Event.start <= end_date)
                    )
                )
            else:
                # Only start_date provided - get all events from start_date
                base_query = base_query.where(
                    or_(
                        Event.start >= start_date,
                        and_(Event.repeat_step > 0, Event.start <= start_date)
                    )
                )
                count_query = count_query.where(
                    or_(
                        Event.start >= start_date,
                        and_(Event.repeat_step > 0, Event.start <= start_date)
                    )
                )
            
        count = session.exec(count_query).one()
        statement = base_query.offset(skip).limit(limit)
        events = session.exec(statement).all()
        
        # Filter events based on their occurrences
        if start_date is not None:
            if end_date is not None:
                events = [event for event in events if get_event_occurrences_in_range(event, start_date, end_date)]
            else:
                # For start_date only, check if event or any of its recurrences starts after start_date
                events = [event for event in events if get_event_occurrences_in_range(event, start_date, datetime.max.replace(tzinfo=timezone.utc))]
            count = len(events)

    return EventsPublic(data=events, count=count)

@router.get("/permissions-and-participants")
def get_events_with_permissions(
    session: SessionDep,
    current_user: CurrentUser,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """
    Get events with permissions and participants information.
    If start_date is provided, returns events starting from that date.
    If both start_date and end_date are provided, returns events within that range.
    """
    # Normalize start_date if provided
    if start_date is not None:
        start_date = normalize_datetime(start_date)
    
    # Normalize end_date if provided
    if end_date is not None:
        end_date = normalize_datetime(end_date)
        # Verify time range validity if both dates are provided
        if start_date is not None and start_date >= end_date:
            raise HTTPException(
                status_code=400,
                detail="Start date must be before end date"
            )

    # 1. Categories where user - is a participant
    category_participants = session.exec(
        select(CategoryParticipant).where(CategoryParticipant.user_id == current_user.id)
    ).all()
    allowed_category_ids = [cp.category_id for cp in category_participants]

    # 2. All relations of events with those categories
    event_category_links = session.exec(
        select(EventCategoryLink).where(EventCategoryLink.category_id.in_(allowed_category_ids))
    ).all()

    event_to_categories = {}
    for link in event_category_links:
        event_to_categories.setdefault(link.event_id, set()).add(link.category_id)

    event_ids_from_categories = set(event_to_categories.keys())

    # 3. Add events, where user is non creator but participant (even if it has no categories)
    user_participations = session.exec(
        select(EventParticipant).where(EventParticipant.user_id == current_user.id)
    ).all()
    user_event_ids = {ep.event_id for ep in user_participations}

    for ep in user_participations:
        event_to_categories.setdefault(ep.event_id, set())

    all_event_ids = list(event_to_categories.keys())
    if not all_event_ids:
        return []

    # 4. Load events, participant and relations with categories
    base_query = select(Event).where(Event.id.in_(all_event_ids))
    
    # Add time range filters if provided
    if start_date is not None:
        if end_date is not None:
            # Both dates provided - check for events in range
            base_query = base_query.where(
                or_(
                    and_(Event.start <= end_date, Event.end >= start_date),
                    and_(Event.repeat_step > 0, Event.start <= end_date)
                )
            )
        else:
            # Only start_date provided - get all events from start_date
            base_query = base_query.where(
                or_(
                    Event.start >= start_date,
                    and_(Event.repeat_step > 0, Event.start <= start_date)
                )
            )
    
    events = session.exec(base_query).all()

    # Preload of relations: EventParticipant + EventCategoryLink + User
    all_event_participants = session.exec(
        select(EventParticipant).where(EventParticipant.event_id.in_(all_event_ids))
    ).all()

    user_ids = {ep.user_id for ep in all_event_participants}
    users = session.exec(select(User).where(User.id.in_(user_ids))).all()
    user_map = {u.id: u for u in users}

    # Group participants by event
    event_id_to_participants = {}
    for ep in all_event_participants:
        event_id_to_participants.setdefault(ep.event_id, []).append(ep)

    result = []
    for event in events:
        participant = next((p for p in user_participations if p.event_id == event.id), None)
        if event.is_private and not participant:
            continue

        # Filter events based on their occurrences if time range is provided
        if start_date is not None:
            if end_date is not None:
                if not get_event_occurrences_in_range(event, start_date, end_date):
                    continue
            else:
                if not get_event_occurrences_in_range(event, start_date, datetime.max.replace(tzinfo=timezone.utc)):
                    continue

        permissions = participant.permissions if participant else EventPermission.VIEW

        result.append({
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "start": event.start,
            "end": event.end,
            "type": event.type,
            "repeat_step": event.repeat_step,
            "is_private": event.is_private,
            "priority": event.priority,
            "creator_id": event.creator_id,
            "is_finished": event.is_finished,
            "max_repeats_count": event.max_repeats_count,
            "permissions": permissions,
            "eventcategories": [
                {"category_id": cid} for cid in event_to_categories.get(event.id, [])
            ],
            "eventparticipants": [
                {
                    "is_creator": ep.is_creator,
                    "is_listener": ep.is_listener,
                    "user": {
                        "id": user_map[ep.user_id].id,
                        "full_name": user_map[ep.user_id].full_name,
                        "email": user_map[ep.user_id].email,
                        "position": user_map[ep.user_id].position,
                        "department": user_map[ep.user_id].department,
                    }
                }
                for ep in event_id_to_participants.get(event.id, [])
                if ep.user_id in user_map
            ]
        })

    return result

@router.get("/{id}", response_model=EventPublic)
def read_event(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get event by ID.
    """
    event = session.get(Event, id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if not check_event_permissions(session, current_user, event, EventPermission.VIEW):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return event

@router.post("/", response_model=EventPublic)
def create_event(
    *, session: SessionDep, current_user: CurrentUser, event_in: EventCreate
) -> Any:
    """
    Create new event.
    """
    # Проверяем корректность времени
    if event_in.start >= event_in.end:
        raise HTTPException(
            status_code=400,
            detail="Event start time must be before end time"
        )

    # Проверяем права на создание события в категории
    if not check_category_permissions(session, current_user, event_in.category_id, CategoryPermission.EDIT):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to create events in this category"
        )

    try:
        # Создаем событие без category_id и participants
        event_data = event_in.model_dump(exclude={"category_id", "participants"})
        event = Event.model_validate(event_data, update={"creator_id": current_user.id})
        session.add(event)
        session.flush()

        # Создаем связь с категорией
        link = EventCategoryLink(event_id=event.id, category_id=event_in.category_id)
        session.add(link)

        # Add creator as participant with ORGANIZE permissions
        creator_participant = EventParticipant(
            event_id=event.id,
            user_id=current_user.id,
            is_creator=True,
            is_listener=True,
            permissions=EventPermission.ORGANIZE
        )
        session.add(creator_participant)

        # Добавляем участников, если они указаны
        if event_in.participants:
            for participant in event_in.participants:
                if participant.user_id == current_user.id:
                    continue

                # Проверяем существование пользователя
                user = session.get(User, participant.user_id)
                if not user:
                    raise HTTPException(
                        status_code=404,
                        detail=f"User with ID {participant.user_id} not found"
                    )

                # Создаем участника события
                event_participant = EventParticipant(
                    event_id=event.id,
                    user_id=participant.user_id,
                    is_creator=participant.is_creator,
                    is_listener=participant.is_listener,
                    permissions=participant.permissions
                )
                session.add(event_participant)

        session.commit()
        session.refresh(event)
        return event

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create event: {str(e)}"
        )

@router.put("/{id}", response_model=EventPublic)
def update_event(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    event_in: EventUpdate
) -> Any:
    """
    Update an event.
    """
    event = session.get(Event, id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Проверяем права на обновление события
    if not check_event_permissions(session, current_user, event, EventPermission.ORGANIZE):
        raise HTTPException(status_code=403, detail="Not enough permissions to update this event")

    # Если пытаемся изменить категорию, проверяем права на новую категорию
    if event_in.category_id and event_in.category_id != event.categories[0].id:
        if not check_category_permissions(session, current_user, event_in.category_id, CategoryPermission.EDIT):
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions to move event to this category"
            )

    # Обновляем данные события
    event_data = event_in.model_dump(exclude_unset=True)
    for field, value in event_data.items():
        setattr(event, field, value)

    # Если изменилась категория, обновляем связь
    if event_in.category_id and event_in.category_id != event.categories[0].id:
        # Удаляем старую связь
        old_link = session.exec(
            select(EventCategoryLink).where(EventCategoryLink.event_id == event.id)
        ).first()
        if old_link:
            session.delete(old_link)
        
        # Создаем новую связь
        new_link = EventCategoryLink(event_id=event.id, category_id=event_in.category_id)
        session.add(new_link)

    session.add(event)
    session.commit()
    session.refresh(event)
    return event

@router.delete("/{id}", response_model=Message)
def delete_event(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID
) -> Any:
    """
    Delete an event.
    """
    event = session.get(Event, id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Проверяем права на удаление события
    if not check_event_permissions(session, current_user, event, EventPermission.ORGANIZE):
        raise HTTPException(status_code=403, detail="Not enough permissions to delete this event")

    session.delete(event)
    session.commit()
    return Message(message="Event deleted successfully")
