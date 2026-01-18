from fastapi import HTTPException, Response
import httpx
import yt_dlp
from typing import Any, cast


def get_content_info(url: str):
    ydl_opts = {"skip_download": True, "quiet": True}
    with yt_dlp.YoutubeDL(cast(Any, ydl_opts)) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    formats = []
    raw_formats = info.get("formats") or []
    for f in raw_formats:
        formats.append({
            "format_id": f.get("format_id"),
            "ext": f.get("ext"),
            "format_note": f.get("format_note"),
            "height": f.get("height"),
            "tbr": f.get("tbr")
        })
        
    return {
        "title": info.get("title"), 
        "id": info.get("id"), 
        "thumbnail": info.get("thumbnail"),
        "thumbnails": info.get("thumbnails"),
        "formats": formats
    }

async def get_thumbnail(url: str):
    async with httpx.AsyncClient() as client:
        r = await client.get(url, timeout=10)
        if r.status_code != 200:
            raise HTTPException(404)
        return Response(
            content=r.content,
            media_type=r.headers.get("content-type", "image/jpeg")
        )
