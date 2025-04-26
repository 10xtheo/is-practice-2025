import sys
import os
from pathlib import Path

# Add the project root directory to PYTHONPATH
project_root = str(Path(__file__).parent.parent)
sys.path.insert(0, project_root)

from datetime import datetime, timedelta
import uuid
from sqlmodel import Session, select
from app.models import (
    User, Event, Category, EventParticipant, CategoryParticipant,
    EventType, EventPriority, CategoryPermission, EventPermission,
    EventCategoryLink
)
from app.core.security import get_password_hash
from app.api.deps import get_db

def seed_database(db: Session):
    # Create users
    users = []
    departments = ["IT", "HR", "Finance", "Marketing", "Sales"]
    positions = ["Manager", "Developer", "Designer", "Analyst", "Specialist"]
    
    for i in range(20):
        user = User(
            email=f"user{i+1}@example.com",
            hashed_password=get_password_hash("password123"),
            full_name=f"User {i+1}",
            is_superuser=i == 0,  # First user is superuser
            position=positions[i % len(positions)],
            department=departments[i % len(departments)]
        )
        users.append(user)
        db.add(user)
    db.commit()
    
    # Create categories
    categories = []
    category_titles = ["Work", "Personal", "Team", "Projects", "Meetings"]
    
    for i, title in enumerate(category_titles):
        category = Category(
            title=title,
            owner_id=users[i % len(users)].id
        )
        categories.append(category)
        db.add(category)
    db.commit()
    
    # Create events
    events = []
    event_types = [EventType.MEETING, EventType.TASK, EventType.REMINDER, EventType.HOLIDAY]
    priorities = [EventPriority.LOW, EventPriority.MEDIUM, EventPriority.HIGH]
    
    for i in range(20):
        event = Event(
            title=f"Event {i+1}",
            description=f"Description for event {i+1}",
            start=datetime.now() + timedelta(days=i),
            end=datetime.now() + timedelta(days=i, hours=2),
            type=event_types[i % len(event_types)],
            priority=priorities[i % len(priorities)],
            creator_id=users[i % len(users)].id
        )
        events.append(event)
        db.add(event)
    db.commit()
    
    # Link events to categories (one category per event)
    for event in events:
        category = categories[event.id.int % len(categories)]
        link = EventCategoryLink(
            event_id=event.id,
            category_id=category.id
        )
        db.add(link)
    db.commit()
    
    # Add category participants
    for category in categories:
        # Add 3-5 random participants to each category
        num_participants = (category.id.int % 3) + 3
        for i in range(num_participants):
            user = users[(category.id.int + i) % len(users)]
            if user.id != category.owner_id:  # Don't add owner as participant
                participant = CategoryParticipant(
                    category_id=category.id,
                    user_id=user.id,
                    permissions=CategoryPermission.EDIT if i % 2 == 0 else CategoryPermission.VIEW
                )
                db.add(participant)
    db.commit()
    
    # Add event participants
    for event in events:
        # Add 2-4 random participants to each event
        num_participants = (event.id.int % 3) + 2
        for i in range(num_participants):
            user = users[(event.id.int + i) % len(users)]
            if user.id != event.creator_id:  # Don't add creator as participant
                participant = EventParticipant(
                    event_id=event.id,
                    user_id=user.id,
                    permissions=EventPermission.EDIT if i % 2 == 0 else EventPermission.VIEW
                )
                db.add(participant)
    db.commit()
    
    print("Database seeded successfully!")

def main():
    for session in get_db():
        seed_database(session)
        break  # We only need one session

if __name__ == "__main__":
    main() 