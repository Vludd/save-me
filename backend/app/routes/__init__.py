from fastapi import APIRouter

from app.routes.media import router as media_router
from app.routes.download import router as download_router


router = APIRouter()
router.include_router(media_router, prefix="/media")
router.include_router(download_router, prefix="/download")
