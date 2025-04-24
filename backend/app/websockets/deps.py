from typing import Annotated

from fastapi import Depends, Query, WebSocket, WebSocketException, status
import jwt
from pydantic import ValidationError

from app.core import security, config
from app.core.config import settings
from app.models import User
from app.api.deps import SessionDep
from app.models import TokenPayload

TokenWS = Annotated[str, Query(alias="token")]

async def get_current_user_ws(
    token: TokenWS,
    session: SessionDep,
) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[security.ALGORITHM])
        token_data = TokenPayload(**payload)
    except (jwt.InvalidTokenError, ValidationError):
        raise WebSocketException(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="Could not validate credentials",
        )
    user = session.get(User, token_data.sub)
    if not user:
        raise WebSocketException(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="User not found",
        )
    if not user.is_active:
        raise WebSocketException(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="Inactive user",
        )
    return user

CurrentUserWS = Annotated[User, Depends(get_current_user_ws)]
