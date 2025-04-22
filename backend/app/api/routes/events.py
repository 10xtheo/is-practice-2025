import uuid
from typing import Any, List
from sqlalchemy import or_, and_, func
from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser , SessionDep
from app.models import Event, EventCreate, EventPublic, EventsPublic, EventUpdate, Message, EventParticipant, EventPermission, EventParticipantsPublic, CategoryParticipant, CategoryPermission, EventCategoryLink, User

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/", response_model=EventsPublic)
def read_events(
    session: SessionDep, current_user: CurrentUser , skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve events.
    """
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Event)
        count = session.exec(count_statement).one()
        statement = select(Event).offset(skip).limit(limit)
        events = session.exec(statement).all()
    else:
        # Count events where the user is either the creator or a participant
        count_statement = (
            select(func.count())
            .select_from(Event)
            .join(EventParticipant)
            .where((Event.creator_id == current_user.id) | (EventParticipant.user_id == current_user.id))
        )
        count = session.exec(count_statement).one()

        # Select events where the user is either the creator or a participant
        statement = (
            select(Event)
            .join(EventParticipant)
            .where((Event.creator_id == current_user.id) | (EventParticipant.user_id == current_user.id))
            .offset(skip)
            .limit(limit)
        )
        events = session.exec(statement).all()

    return EventsPublic(data=events, count=count)

@router.get("/permissions-and-participants")
def get_events_with_permissions(
    session: SessionDep,
    current_user: CurrentUser,
):
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
    events = session.exec(
        select(Event).where(Event.id.in_(all_event_ids))
    ).all()

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
def read_event(session: SessionDep, current_user: CurrentUser , id: uuid.UUID) -> Any:
    """
    Get event by ID.
    """
    event = session.get(Event, id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check if the user is the creator or a participant
    is_creator = event.creator_id == current_user.id
    is_participant = session.exec(
        select(EventParticipant).where(
            EventParticipant.event_id == event.id,
            EventParticipant.user_id == current_user.id
        )
    ).first() is not None

    if not current_user.is_superuser and not (is_creator or is_participant):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return event

@router.post("/", response_model=EventPublic)
def create_event(
    *, session: SessionDep, current_user: CurrentUser , event_in: EventCreate
) -> Any:
    """
    Create new event.
    """
    event = Event.model_validate(event_in, update={"creator_id": current_user.id})
    session.add(event)
    session.commit()
    session.refresh(event)

    # Create a new EventParticipant
    event_participant = EventParticipant(user_id=current_user.id, event_id=event.id, is_creator=True, is_listener=True)
    session.add(event_participant)

    session.commit()
    return event

@router.put("/{id}", response_model=EventPublic)
def update_event(
    *,
    session: SessionDep,
    current_user: CurrentUser ,
    id: uuid.UUID,
    event_in: EventUpdate,
) -> Any:
    """
    Update an event.
    """
    event = session.get(Event, id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if not current_user.is_superuser and (event.creator_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = event_in.model_dump(exclude_unset=True)
    event.sqlmodel_update(update_dict)
    session.add(event)
    session.commit()
    session.refresh(event)
    return event

@router.delete("/{id}")
def delete_event(
    session: SessionDep, current_user: CurrentUser , id: uuid.UUID
) -> Message:
    """
    Delete an event.
    """
    event = session.get(Event, id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if not current_user.is_superuser and (event.creator_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(event)
    session.commit()
    return Message(message="Event deleted successfully")
