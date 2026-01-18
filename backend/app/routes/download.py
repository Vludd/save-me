from fastapi import APIRouter, BackgroundTasks

from app.schemas import DownloadRequest
from app.services.download import get_status, start_stream


router = APIRouter()

@router.get("/{download_id}")
def status(download_id: str):
    return get_status(download_id)

@router.post("")
def download(body: DownloadRequest, background_tasks: BackgroundTasks):
    return start_stream(body.url, body.format_id, background_tasks)
