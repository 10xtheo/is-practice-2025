import uuid
from typing import Any, List, Optional
from sqlalchemy import or_, and_, func
from fastapi import APIRouter, HTTPException
from sqlmodel import func, select, SQLModel
from datetime import datetime, timedelta

from app.api.deps import CurrentUser, SessionDep
from app.api.routes.utils import check_category_permissions, check_event_permissions
from app.models import (
    Event, EventCreate, EventPublic, EventsPublic, EventUpdate, Message,
    EventParticipant, EventPermission, EventParticipantsPublic,
    CategoryParticipant, CategoryPermission, EventCategoryLink, User, Category,
    MessagesPublic, RepeatType
)

router = APIRouter(prefix="/events", tags=["events"])

class AvailableTimeRequest(SQLModel):
    duration_minutes: int
    participant_ids: List[uuid.UUID]
    start_date: datetime
    end_date: datetime

@router.get("/", response_model=EventsPublic)
def read_events(
    session: SessionDep, 
    current_user: CurrentUser, 
    skip: int = 0, 
    limit: int = 100,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    user_id: uuid.UUID | None = None
) -> Any:
    """
    Retrieve events.
    """
    # # Check dates in timezone-naive if them are provided
    if start_date:
        start_date = start_date.replace(tzinfo=None) if start_date.tzinfo else start_date
    if end_date:
        end_date = end_date.replace(tzinfo=None) if end_date.tzinfo else end_date

    # Check for rights on getting other user's events
    if user_id is not None and user_id != current_user.id:
        if not current_user.is_superuser:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions to view other user's events"
            )
        # Check for user existance
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=404,
                detail=f"User with ID {user_id} not found"
            )

    # Check data format
    if start_date is not None and end_date is not None and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before end_date"
        )

    if current_user.is_superuser:
        query = select(Event)
        
        # Filter by user if set
        if user_id is not None:
            query = query.where(Event.creator_id == user_id)
        
        # Filter by data
        if start_date is not None:
            query = query.where(Event.start >= start_date)
        if end_date is not None:
            query = query.where(Event.end <= end_date)
            
        # Receiving whole count
        count_statement = select(func.count()).select_from(query.subquery())
        count = session.exec(count_statement).one()
        
        # Add paging
        statement = query.offset(skip).limit(limit)
        events = session.exec(statement).all()
    else:
        # Receive events where user participates
        user_participations = session.exec(
            select(EventParticipant).where(EventParticipant.user_id == current_user.id)
        ).all()
        user_event_ids = {ep.event_id for ep in user_participations}

        # Receive categoires to which user have access
        accessible_categories = session.exec(
            select(Category.id).join(CategoryParticipant).where(
                or_(
                    Category.owner_id == current_user.id,
                    CategoryParticipant.user_id == current_user.id
                )
            )
        ).all()

        # Receive events via allowed categories
        category_events = session.exec(
            select(Event.id)
            .join(EventCategoryLink)
            .where(EventCategoryLink.category_id.in_(accessible_categories))
        ).all()
        category_event_ids = {event.id for event in category_events}

        # Unite ids of events
        all_event_ids = list(user_event_ids | category_event_ids)
        if not all_event_ids:
            return EventsPublic(data=[], count=0)

        # Basic query filtered on event ids
        query = select(Event).where(Event.id.in_(all_event_ids))
        
        # Ddate filter
        if start_date is not None:
            query = query.where(Event.start >= start_date)
        if end_date is not None:
            query = query.where(Event.end <= end_date)
            
        # Receiving whole count
        count_statement = select(func.count()).select_from(query.subquery())
        count = session.exec(count_statement).one()
        
        # Adding paging
        statement = query.offset(skip).limit(limit)
        events = session.exec(statement).all()

    return EventsPublic(data=events, count=count)

@router.get("/permissions-and-participants")
def get_events_with_permissions(
    session: SessionDep,
    current_user: CurrentUser,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    user_id: uuid.UUID | None = None
):
    """
    Get events with permissions and participants.
    """
    # Check dates in timezone-naive if them are provided
    if start_date:
        start_date = start_date.replace(tzinfo=None) if start_date.tzinfo else start_date
    if end_date:
        end_date = end_date.replace(tzinfo=None) if end_date.tzinfo else end_date

    # Check user's rights on getting other users
    if user_id is not None and user_id != current_user.id:
        if not current_user.is_superuser:
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions to view other user's events"
            )
        # Check user existance
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=404,
                detail=f"User with ID {user_id} not found"
            )

    # Check date
    if start_date is not None and end_date is not None and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before end_date"
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

    # 3. Add events, where user is non creator but participant (even if it has no categores)
    user_participations = session.exec(
        select(EventParticipant).where(EventParticipant.user_id == current_user.id)
    ).all()
    user_event_ids = {ep.event_id for ep in user_participations}

    for ep in user_participations:
        event_to_categories.setdefault(ep.event_id, set())

    all_event_ids = list(event_to_categories.keys())
    if not all_event_ids:
        return []

    # 4. Load events, participant and relations with catetgories
    query = select(Event).where(Event.id.in_(all_event_ids))

    # Users filtering if set
    if user_id is not None:
        if current_user.is_superuser:
            query = query.where(Event.creator_id == user_id)
        else:
            query = query.where(Event.creator_id == current_user.id)

    # Date filtering
    if start_date is not None:
        query = query.where(Event.start >= start_date)
    if end_date is not None:
        query = query.where(Event.end <= end_date)

    events = session.exec(query).all()

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
                    "permissions": ep.permissions,
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

def create_recurring_events(
    session: SessionDep,
    base_event: Event,
    event_in: EventCreate | EventUpdate,
    current_user: CurrentUser
) -> List[Event]:
    """
    Creates recurring events based on the base event.
    Events are created based on either max_repeats_count or repeat_until,
    whichever is more restrictive.
    """
    if event_in.repeat_type == RepeatType.none or event_in.repeat_step == 0:
        return []

    # Convert dates to timezone-naive
    base_start = base_event.start.replace(tzinfo=None) if base_event.start.tzinfo else base_event.start
    base_end = base_event.end.replace(tzinfo=None) if base_event.end.tzinfo else base_event.end
    repeat_until = event_in.repeat_until.replace(tzinfo=None) if event_in.repeat_until and event_in.repeat_until.tzinfo else event_in.repeat_until

    # Calculate event duration
    duration = base_end - base_start
    
    # Determine step based on repeat type
    if event_in.repeat_type == RepeatType.hourly:
        step = timedelta(hours=event_in.repeat_step)
    elif event_in.repeat_type == RepeatType.daily:
        step = timedelta(days=event_in.repeat_step)
    elif event_in.repeat_type == RepeatType.weekly:
        step = timedelta(weeks=event_in.repeat_step)
    elif event_in.repeat_type == RepeatType.monthly:
        step = timedelta(days=30 * event_in.repeat_step)
    elif event_in.repeat_type == RepeatType.yearly:
        step = timedelta(days=365 * event_in.repeat_step)
    else:
        return []

    recurring_events = []
    current_start = base_start + step
    current_end = base_end + step
    repeats_count = 0

    # Maximum future date for event creation (10 years ahead)
    max_future_date = datetime.now() + timedelta(days=3650)

    # Get current category ID
    current_category_link = session.query(EventCategoryLink).filter(
        EventCategoryLink.event_id == base_event.id
    ).first()
    category_id = current_category_link.category_id if current_category_link else None

    # If category_id is provided in event_in, use it
    if isinstance(event_in, EventCreate):
        category_id = event_in.category_id
    elif isinstance(event_in, EventUpdate) and hasattr(event_in, 'category_id') and event_in.category_id is not None:
        category_id = event_in.category_id

    # Create recurring events
    while True:
        # Check if we've reached the maximum number of repeats
        if event_in.max_repeats_count > 0 and repeats_count >= event_in.max_repeats_count:
            break
            
        # Check if we've reached the repeat_until date
        if repeat_until and current_start > repeat_until:
            break
            
        # Check if event is too far in the future
        if current_start > max_future_date:
            break

        # Create new event
        new_event = Event(
            title=base_event.title,
            description=base_event.description,
            start=current_start,
            end=current_end,
            type=base_event.type,
            repeat_type=RepeatType.recurring_duplicate,  # Mark as duplicate
            repeat_step=event_in.repeat_step,
            is_private=base_event.is_private,
            priority=base_event.priority,
            creator_id=current_user.id
        )
        session.add(new_event)
        session.flush()

        # Create category link if category exists
        if category_id:
            link = EventCategoryLink(event_id=new_event.id, category_id=category_id)
            session.add(link)

        # Copy participants from base event
        for participant in base_event.participants:
            new_participant = EventParticipant(
                event_id=new_event.id,
                user_id=participant.user_id,
                is_creator=participant.is_creator,
                is_listener=participant.is_listener,
                permissions=participant.permissions
            )
            session.add(new_participant)

        recurring_events.append(new_event)
        repeats_count += 1

        # Update time for next event
        current_start += step
        current_end += step

    return recurring_events

@router.post("/", response_model=EventPublic)
def create_event(
    *, session: SessionDep, current_user: CurrentUser, event_in: EventCreate
) -> Any:
    """
    Create new event.
    """
    # Convert dates to timezone-naive for comparison
    start_date = event_in.start.replace(tzinfo=None) if event_in.start.tzinfo else event_in.start
    end_date = event_in.end.replace(tzinfo=None) if event_in.end.tzinfo else event_in.end
    repeat_until = event_in.repeat_until.replace(tzinfo=None) if event_in.repeat_until and event_in.repeat_until.tzinfo else event_in.repeat_until

    # Validate time range
    if start_date >= end_date:
        raise HTTPException(
            status_code=400,
            detail="Event start time must be before end time"
        )

    # Validate recurring event parameters
    if event_in.repeat_type != RepeatType.none and event_in.repeat_step > 0:
        if not repeat_until and event_in.max_repeats_count == 0:
            raise HTTPException(
                status_code=400,
                detail="Either repeat_until or max_repeats_count must be specified for recurring events"
            )
        if repeat_until and repeat_until <= start_date:
            raise HTTPException(
                status_code=400,
                detail="repeat_until must be after event start time"
            )

    # Check permissions for creating event in category
    if not check_category_permissions(session, current_user, event_in.category_id, CategoryPermission.EDIT):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to create events in this category"
        )

    try:
        # Create event without category_id and participants
        event_data = event_in.model_dump(exclude={"category_id", "participants"})
        # Ensure dates in event_data are timezone-naive
        event_data["start"] = start_date
        event_data["end"] = end_date
        if repeat_until:
            event_data["repeat_until"] = repeat_until

        # If this is a recurring event, mark it as parent
        if event_in.repeat_type != RepeatType.none and event_in.repeat_step > 0:
            event_data["repeat_type"] = RepeatType.recurring_parent

        event = Event.model_validate(event_data, update={"creator_id": current_user.id})
        session.add(event)
        session.flush()

        # Create category link
        link = EventCategoryLink(event_id=event.id, category_id=event_in.category_id)
        session.add(link)

        # Add creator as participant with ORGANIZE permissions
        creator_participant = EventParticipant(
            event_id=event.id,
            user_id=current_user.id,
            is_creator=True,
            is_listener=False,
            permissions=EventPermission.ORGANIZE
        )
        session.add(creator_participant)

        # Add participants if provided
        if event_in.participants:
            for participant in event_in.participants:
                if participant.user_id == current_user.id:
                    continue

                # Check for user existence
                user = session.get(User, participant.user_id)
                if not user:
                    raise HTTPException(
                        status_code=404,
                        detail=f"User with ID {participant.user_id} not found"
                    )

                # Create event participant
                event_participant = EventParticipant(
                    event_id=event.id,
                    user_id=participant.user_id,
                    is_creator=participant.is_creator,
                    is_listener=participant.is_listener,
                    permissions=participant.permissions
                )
                session.add(event_participant)

        # Create repeating events
        recurring_events = create_recurring_events(session, event, event_in, current_user)

        session.commit()
        session.refresh(event)
        return event

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create event: {str(e)}"
        )

@router.put("/{event_id}", response_model=EventPublic)
def update_event(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    event_id: uuid.UUID,
    event_in: EventUpdate
) -> Any:
    """
    Update event.
    """
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found"
        )

    # Check permissions for event update
    if not check_event_permissions(session, current_user, event, EventPermission.EDIT):
        raise HTTPException(
            status_code=403,
            detail="Not enough permissions to update this event"
        )

    # Get current category ID
    current_category_link = session.query(EventCategoryLink).filter(
        EventCategoryLink.event_id == event.id
    ).first()
    current_category_id = current_category_link.category_id if current_category_link else None

    # If trying to change category, check permissions for the new category
    if event_in.category_id and event_in.category_id != current_category_id:
        if not check_category_permissions(session, current_user, event_in.category_id, CategoryPermission.EDIT):
            raise HTTPException(
                status_code=403,
                detail="Not enough permissions to move event to this category"
            )

    # Convert dates to timezone-naive for comparison
    start_date = event_in.start.replace(tzinfo=None) if event_in.start and event_in.start.tzinfo else event_in.start
    end_date = event_in.end.replace(tzinfo=None) if event_in.end and event_in.end.tzinfo else event_in.end
    repeat_until = event_in.repeat_until.replace(tzinfo=None) if event_in.repeat_until and event_in.repeat_until.tzinfo else event_in.repeat_until

    # Validate time range
    if start_date and end_date and start_date >= end_date:
        raise HTTPException(
            status_code=400,
            detail="Event start time must be before end time"
        )

    # Check if trying to make a duplicate event recurring
    if event.repeat_type == RepeatType.recurring_duplicate:
        raise HTTPException(
            status_code=400,
            detail="Cannot make a duplicate event recurring"
        )

    # Validate recurring event parameters
    if event_in.repeat_type and event_in.repeat_type != RepeatType.none and event_in.repeat_step and event_in.repeat_step > 0:
        if not repeat_until and event_in.max_repeats_count == 0:
            raise HTTPException(
                status_code=400,
                detail="Either repeat_until or max_repeats_count must be specified for recurring events"
            )
        if repeat_until and repeat_until <= (start_date or event.start):
            raise HTTPException(
                status_code=400,
                detail="repeat_until must be after event start time"
            )

    try:
        # Update event data
        event_data = event_in.model_dump(exclude_unset=True)
        if start_date:
            event_data["start"] = start_date
        if end_date:
            event_data["end"] = end_date
        if repeat_until:
            event_data["repeat_until"] = repeat_until

        # If this is a recurring event, mark it as parent
        if event_in.repeat_type and event_in.repeat_type != RepeatType.none and event_in.repeat_step and event_in.repeat_step > 0:
            event_data["repeat_type"] = RepeatType.recurring_parent

        # Remove category_id from event_data as it's not a field in Event model
        category_id = event_data.pop("category_id", None)

        for field, value in event_data.items():
            setattr(event, field, value)

        # If category changed, update the link
        if category_id and category_id != current_category_id:
            # Remove old category link
            if current_category_link:
                session.delete(current_category_link)

            # Create new category link
            new_link = EventCategoryLink(event_id=event.id, category_id=category_id)
            session.add(new_link)

        # If event becomes recurring, create recurring events
        if event_in.repeat_type and event_in.repeat_type != RepeatType.none and event_in.repeat_step and event_in.repeat_step > 0:
            # Create recurring events
            recurring_events = create_recurring_events(session, event, event_in, current_user)

        session.commit()
        session.refresh(event)
        return event

    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update event: {str(e)}"
        )

@router.delete("/{id}", response_model=Message)
def delete_event(
    *,
    session: SessionDep,
    current_user: CurrentUser ,
    id: uuid.UUID
) -> Any:
    """
    Delete an event.
    """
    event = session.get(Event, id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check permissions
    if not check_event_permissions(session, current_user, event, EventPermission.ORGANIZE):
        raise HTTPException(status_code=403, detail="Not enough permissions to delete this event")

    # Delete related participants
    participants = session.exec(
        select(EventParticipant).where(EventParticipant.event_id == id)
    ).all()
    
    for participant in participants:
        session.delete(participant)

    # Now delete the event
    session.delete(event)
    session.commit()
    
    return Message(message="Event deleted successfully")

@router.post("/find-available-time", response_model=List[datetime])
def find_available_time(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    request: AvailableTimeRequest
) -> Any:
    """
    Find available time slots for event participants.
    Returns a list of possible start times where all participants are available.
    Maximum 200 slots will be returned.
    """
    # Convert dates to naive if they are timezone-aware
    start_date = request.start_date.replace(tzinfo=None) if request.start_date.tzinfo else request.start_date
    end_date = request.end_date.replace(tzinfo=None) if request.end_date.tzinfo else request.end_date

    # Add current user to the list of participants if not already included
    all_participant_ids = list(set([*request.participant_ids, current_user.id]))

    # Get all events for the participants in the given time range
    participant_events = session.exec(
        select(Event)
        .join(EventParticipant)
        .where(
            and_(
                EventParticipant.user_id.in_(all_participant_ids),
                or_(
                    and_(Event.start >= start_date, Event.start < end_date),
                    and_(Event.end > start_date, Event.end <= end_date),
                    and_(Event.start <= start_date, Event.end >= end_date)
                )
            )
        )
    ).all()

    # Create a list of busy time ranges
    busy_ranges = []
    for event in participant_events:
        # Convert event times to naive if they are timezone-aware
        event_start = event.start.replace(tzinfo=None) if event.start.tzinfo else event.start
        event_end = event.end.replace(tzinfo=None) if event.end.tzinfo else event.end
        
        # Ensure we only consider events within our time range
        event_start = max(event_start, start_date)
        event_end = min(event_end, end_date)
        
        busy_ranges.append((event_start, event_end))

    # Sort busy ranges by start time
    busy_ranges.sort(key=lambda x: x[0])

    # Find available slots
    available_slots = []
    current_time = start_date
    MAX_SLOTS = 200

    while (current_time + timedelta(minutes=request.duration_minutes) <= end_date and 
           len(available_slots) < MAX_SLOTS):
        # Check if current time slot overlaps with any busy range
        is_available = True
        for busy_start, busy_end in busy_ranges:
            # If current slot ends before busy period starts or starts after busy period ends
            if (current_time + timedelta(minutes=request.duration_minutes) <= busy_start or 
                current_time >= busy_end):
                continue
            else:
                is_available = False
                # Skip to the end of this busy period
                current_time = busy_end
                break

        if is_available:
            available_slots.append(current_time)
            # Move to next minute
            current_time += timedelta(minutes=1)
        else:
            # We already moved current_time in the loop above
            continue

    return available_slots

@router.get("/{event_id}/messages", response_model=MessagesPublic)
def get_event_messages(
    event_id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser  
) -> Any:
    """
    Retrieve all messages for a specific event based on the event ID.
    """
    # Retrieve the event from the database
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    # Check if the user is a participant in the event
    is_participant = session.exec(
        select(EventParticipant).where(
            EventParticipant.event_id == event_id,
            EventParticipant.user_id == current_user.id
        )
    ).first()
    if not is_participant:
        raise HTTPException(status_code=403, detail="User  is not a participant in this event.")
    # Query to get all messages for the specified event
    statement = select(Message).where(Message.event_id == event_id)
    messages = session.exec(statement).all()
    return MessagesPublic(data=messages, count=len(messages))
