from fastapi import APIRouter, Query

from app.services.info import get_content_info, get_thumbnail


router = APIRouter()

@router.get("/info")
def info(url: str = Query(...)):
    return get_content_info(url)

@router.get("/thumbnail")
async def thumbnail(url: str):
    return await get_thumbnail(url)
