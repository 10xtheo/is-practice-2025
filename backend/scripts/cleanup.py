import sys
import os
from pathlib import Path

# Add the project root directory to PYTHONPATH
project_root = str(Path(__file__).parent.parent)
sys.path.insert(0, project_root)

from sqlmodel import Session
from app.models import (
    User, Event, Category, EventParticipant, CategoryParticipant,
    EventCategoryLink
)
from app.api.deps import get_db

def cleanup_database(session: Session):
    # Delete all data in reverse order of dependencies
    session.query(EventParticipant).delete()
    session.query(CategoryParticipant).delete()
    session.query(EventCategoryLink).delete()
    session.query(Event).delete()
    session.query(Category).delete()
    session.query(User).delete()
    session.commit()
    print("Database cleaned successfully!")

def main():
    for session in get_db():
        cleanup_database(session)
        break  # We only need one session

if __name__ == "__main__":
    main() 