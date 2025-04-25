import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel

# --- Add Enums first ---
class EventType(str, Enum):
    MEETING = "meeting"
    TASK = "task"
    REMINDER = "reminder"
    HOLIDAY = "holiday"

class EventPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class CategoryPermission(str, Enum):
    VIEW = "view"
    EDIT = "edit"
    MANAGE = "manage"

class EventPermission(str, Enum):
    VIEW = "view"
    EDIT = "edit"
    ORGANIZE = "organize"


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)
    # New fields
    position: str | None = Field(default=None, max_length=255)
    department: str | None = Field(default=None, max_length=255)

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)
    # New fields
    position: str | None = Field(default=None, max_length=255)
    department: str | None = Field(default=None, max_length=255)

# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)
    # New fields - relation with events
    events: list["Event"] = Relationship(back_populates="creator", cascade_delete=True)
    # New fields - relation with categories
    categories: list["Category"] = Relationship(back_populates="owner", cascade_delete=True)
    # New fields - relation with category_participations
    category_participations: list["CategoryParticipant"] = Relationship(back_populates="user")
    event_participations: list["EventParticipant"] = Relationship(back_populates="user")

# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID

class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int

# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)

# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass

# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore

# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")

# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID

class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"

# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None

class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)



# Add this association table for many-to-many relationship
class EventCategoryLink(SQLModel, table=True):
    event_id: uuid.UUID = Field(
        foreign_key="event.id",
        primary_key=True
    )
    category_id: uuid.UUID = Field(
        foreign_key="category.id",
        primary_key=True
    )


class CategoryBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(SQLModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)

class Category(CategoryBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", 
        nullable=False,
        ondelete="CASCADE"
    )
    owner: "User" = Relationship(back_populates="categories")
    events: list["Event"] = Relationship(
        back_populates="categories",
        link_model=EventCategoryLink
    )
    # New fields - relation with category_participations
    participants: list["CategoryParticipant"] = Relationship(back_populates="category")

class CategoryPublic(CategoryBase):
    id: uuid.UUID
    owner_id: uuid.UUID

class CategoriesPublic(SQLModel):
    data: list[CategoryPublic]
    count: int

class CategoryParticipant(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    category_id: uuid.UUID = Field(foreign_key="category.id")
    user_id: uuid.UUID = Field(foreign_key="user.id")
    is_creator: bool = False
    permissions: CategoryPermission = CategoryPermission.VIEW
    # Relationships
    category: "Category" = Relationship(back_populates="participants")
    user: "User" = Relationship(back_populates="category_participations")

class CategoryParticipantCreate(SQLModel):
    user_id: uuid.UUID
    is_creator: bool = False
    permissions: CategoryPermission = CategoryPermission.VIEW

class CategoryParticipantUpdate(SQLModel):
    is_creator: bool | None = None
    permissions: CategoryPermission | None = None

class CategoryParticipantPublic(CategoryParticipantCreate):
    id: uuid.UUID
    category_id: uuid.UUID

class CategoryParticipantsPublic(SQLModel):
    data: list[CategoryParticipantPublic]
    count: int


# --- Event Models ---
class EventBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=500)
    start: datetime
    end: datetime
    type: EventType
    repeat_step: int = Field(default=0, ge=0)  # 0 = no repeat
    is_private: bool = False
    priority: EventPriority = EventPriority.MEDIUM
    is_finished: bool = False
    max_repeats_count: int = Field(default=0, ge=0)

class EventCreate(EventBase):
    pass

class EventUpdate(SQLModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=500)
    start: datetime | None = None
    end: datetime | None = None
    type: EventType | None = None
    repeat_step: int | None = Field(default=None, ge=0)
    is_private: bool | None = None
    priority: EventPriority | None = None
    is_finished: bool | None = None
    max_repeats_count: int | None = Field(default=None, ge=0)

class Event(EventBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    creator_id: uuid.UUID = Field(
        foreign_key="user.id", 
        nullable=False, 
        ondelete="CASCADE"
    )
    creator: Optional["User"] = Relationship(back_populates="events")
    categories: list["Category"] = Relationship(
        back_populates="events",
        link_model=EventCategoryLink,
        # cascade_delete=True
    )
    participants: list["EventParticipant"] = Relationship(back_populates="event")

class EventPublic(EventBase):
    id: uuid.UUID
    creator_id: uuid.UUID

class EventsPublic(SQLModel):
    data: list[EventPublic]
    count: int

class EventParticipant(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    event_id: uuid.UUID = Field(foreign_key="event.id")
    user_id: uuid.UUID = Field(foreign_key="user.id")
    is_creator: bool = False
    is_listener: bool = False
    permissions: EventPermission = EventPermission.VIEW

    # Relationships
    event: "Event" = Relationship(back_populates="participants")
    user: "User" = Relationship(back_populates="event_participations")

class EventParticipantCreate(SQLModel):
    user_id: uuid.UUID
    is_creator: bool = False
    is_listener: bool = False
    permissions: EventPermission = EventPermission.VIEW

class EventParticipantUpdate(SQLModel):
    is_creator: bool | None = None
    is_listener: bool | None = None
    permissions: EventPermission | None = None

class EventParticipantPublic(EventParticipantCreate):
    id: uuid.UUID
    event_id: uuid.UUID

class EventParticipantsPublic(SQLModel):
    data: list[EventParticipantPublic]
    count: int


class Notification(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID
    event_id: uuid.UUID
    send_at: datetime
    sent: bool = False
