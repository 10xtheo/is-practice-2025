import os
import shutil
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from fastapi import status
from app.websockets.manager import manager
from app.api.deps import CurrentUser , SessionDep
from app.chat.permissions import is_user_participant_of_event
from urllib.parse import quote
from ...models import UploadResponse

router = APIRouter()

UPLOAD_DIRECTORY = "uploaded_files"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.post("/uploadfile/", response_model=UploadResponse, status_code=status.HTTP_201_CREATED, tags=["File Upload"])
async def upload_file(
    request: Request,
    db: SessionDep,
    event_id: str,
    user: CurrentUser ,
    file: UploadFile = File(...)
):
    # Check user participation
    if not is_user_participant_of_event(db, event_id, user.id):
        raise HTTPException(status_code=403, detail="User  not participant of event")

    # Sanitize filename
    sanitized_filename = quote(file.filename)

    file_location = os.path.join(UPLOAD_DIRECTORY, sanitized_filename)

    try:
        # Save file to disk
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"File {sanitized_filename} uploaded successfully.")
    except Exception as e:
        logger.error(f"Error saving file {sanitized_filename}: {e}")
        raise HTTPException(status_code=500, detail="Error saving file")

    # Construct the full URL
    file_url = f"{request.url.scheme}://{request.headers['host']}/files/{sanitized_filename}"

    message_data = {
        "type": "file",
        "filename": sanitized_filename,
        "file_url": str(file_url),
        "user_id": str(user.id),
        "full_name": user.full_name,
        "event_id": event_id,
    }

    await manager.send_message_to_event(event_id, message_data)

    return UploadResponse(
        filename=sanitized_filename,
        file_url=str(file_url),
        message="File uploaded and event notified"
    )
