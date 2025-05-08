import os
import shutil
import uuid
import logging
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from fastapi import status
from sqlmodel import select
from app.websockets.manager import manager
from app.api.deps import CurrentUser , SessionDep
from app.chat.permissions import is_user_participant_of_event
from urllib.parse import quote
from ...models import UploadResponse, UploadedFile

router = APIRouter()

UPLOAD_DIRECTORY = "uploaded_files"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/events/{event_id}/files", response_model=List[UploadedFile], tags=["File Upload"])
def get_event_files(
    event_id: uuid.UUID,
    db: SessionDep
):
    # Query to get all files for the specified event
    files = db.exec(
        select(UploadedFile).where(UploadedFile.event_id == event_id)
    ).all()
    if not files:
        raise HTTPException(status_code=404, detail="No files found for this event.")
    return files

@router.post("/uploadfile/", response_model=UploadResponse, status_code=status.HTTP_201_CREATED, tags=["File Upload"])
async def upload_file(
    request: Request,
    db: SessionDep,
    event_id: uuid.UUID,
    user: CurrentUser ,
    file: UploadFile = File(...)
):
    # Check user participation
    if not is_user_participant_of_event(db, event_id, user.id):
        raise HTTPException(status_code=403, detail="User  not participant of event")

    # Sanitize filename
    sanitized_filename = quote(file.filename)

    # Check if a file with the same name already exists for the event
    existing_file = db.exec(
        select(UploadedFile).where(
            UploadedFile.filename == sanitized_filename,
            UploadedFile.event_id == event_id
        )
    ).first()
    if existing_file:
        raise HTTPException(status_code=400, detail="A file with this name already exists for this event.")

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

    # Save file metadata to the database
    uploaded_file = UploadedFile(
        filename=sanitized_filename,
        file_url=file_url,
        event_id=event_id,
        user_id=user.id
    )
    db.add(uploaded_file)
    db.commit()
    db.refresh(uploaded_file)

    message_data = {
        "type": "file",
        "filename": sanitized_filename,
        "file_url": str(file_url),
        "user_id": str(user.id),
        "full_name": user.full_name,
        "event_id": str(event_id),
    }

    await manager.send_message_to_event(str(event_id), message_data)

    return UploadResponse(
        filename=sanitized_filename,
        file_url=str(file_url),
        message="File uploaded and event notified"
    )

@router.delete("/uploadfile/{file_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["File Upload"])
async def delete_file(
    file_id: uuid.UUID,
    db: SessionDep,
    user: CurrentUser 
):
    # Retrieve the file from the database
    uploaded_file = db.get(UploadedFile, file_id)
    if not uploaded_file:
        raise HTTPException(status_code=404, detail="File not found.")

    # Check if the user is the uploader or a superuser
    if uploaded_file.user_id != user.id and not user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions to delete this file.")

    # Delete the file from the filesystem
    file_location = os.path.join(UPLOAD_DIRECTORY, uploaded_file.filename)
    if os.path.exists(file_location):
        os.remove(file_location)

    # Delete the file record from the database
    db.delete(uploaded_file)
    db.commit()

    return {"message": "File deleted successfully."}

