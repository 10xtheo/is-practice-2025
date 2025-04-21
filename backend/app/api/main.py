from fastapi import APIRouter

from app.api.routes import items, login, private, users, utils, events, categories, event_participants, category_participants
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(events.router)
api_router.include_router(categories.router)
api_router.include_router(event_participants.router)
api_router.include_router(category_participants.router)

if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
