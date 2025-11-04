import os
import threading
from typing import Any, Dict, cast
from pydantic import BaseModel
from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse

import yt_dlp
from pathlib import Path
import uuid

from app.schemas import SInfoRequest

router = APIRouter()

OUT_DIR = Path("/tmp/save.me")
OUT_DIR.mkdir(parents=True, exist_ok=True)

progress_store: Dict[str, Dict] = {}
progress_lock = threading.Lock()

def progress_hook(download_id: str, d: dict):
    with progress_lock:
        info = progress_store.setdefault(download_id, {"status": "started", "percent": 0, "filepath": None, "error": None})
        status = d.get("status")
        if status == "downloading":
            downloaded = d.get("downloaded_bytes") or d.get("downloaded_bytes_estimate") or 0
            total = d.get("total_bytes") or d.get("total_bytes_estimate")
            if total:
                pct = int(min(100, (downloaded / total) * 100))
                info["percent"] = pct
            else:
                # если total неизвестен - используем прогресс в байтах (для UX)
                info["percent"] = 0
            info["status"] = "downloading"
        elif status == "finished":
            info["status"] = "finished"
            # yt_dlp передаёт имя временного файла
            info["filepath"] = d.get("filename") or d.get("filepath")
            info["percent"] = 100
        elif status == "error":
            info["status"] = "error"
            info["error"] = d.get("error") or "unknown error"

def run_download_task(download_id: str, url: str, format_id: str):
    outname = OUT_DIR / (f"{download_id}.%(ext)s")
    ydl_opts = {
        "format": format_id,
        "outtmpl": str(outname),
        "quiet": True,
        "progress_hooks": [lambda d: progress_hook(download_id, d)],
    }
    with yt_dlp.YoutubeDL(cast(Any, ydl_opts)) as ydl:
        try:
            ydl.download([url])
        except Exception as e:
            with progress_lock:
                progress_store.setdefault(download_id, {})["status"] = "error"
                progress_store[download_id]["error"] = str(e)
            return

    # попытаться найти итоговый файл (если hook не установил filepath)
    files = list(OUT_DIR.glob(f"{download_id}.*"))
    if files:
        latest = max(files, key=lambda p: p.stat().st_mtime)
        with progress_lock:
            info = progress_store.setdefault(download_id, {})
            info["filepath"] = str(latest)
            info["status"] = "finished"
            info["percent"] = 100
    else:
        with progress_lock:
            progress_store.setdefault(download_id, {})["status"] = "error"
            progress_store[download_id]["error"] = "No output file"

@router.post("/info")
def info(body: SInfoRequest):
    ydl_opts = {"skip_download": True, "quiet": True}
    with yt_dlp.YoutubeDL(cast(Any, ydl_opts)) as ydl:
        try:
            info = ydl.extract_info(body.url, download=False)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
        
    formats = []
    for f in info.get("formats", []): # type: ignore
        formats.append({
            "format_id": f.get("format_id"),
            "ext": f.get("ext"),
            "format_note": f.get("format_note"),
            "height": f.get("height"),
            "tbr": f.get("tbr")
        })
    return {"title": info.get("title"), "id": info.get("id"), "formats": formats}

@router.post("/download/start")
def download_start(background_tasks: BackgroundTasks, url: str, format_id: str):
    download_id = str(uuid.uuid4())
    with progress_lock:
        progress_store[download_id] = {"status": "queued", "percent": 0, "filepath": None, "error": None}
    background_tasks.add_task(run_download_task, download_id, url, format_id)
    return {"download_id": download_id}

@router.get("/download/status/{download_id}")
def download_status(download_id: str):
    with progress_lock:
        info = progress_store.get(download_id)
        if not info:
            raise HTTPException(status_code=404, detail="Not found")
        return info

@router.get("/download/file/{download_id}")
def download_file(download_id: str):
    with progress_lock:
        info = progress_store.get(download_id)
        if not info:
            raise HTTPException(status_code=404, detail="Not found")
        if info.get("status") != "finished" or not info.get("filepath"):
            raise HTTPException(status_code=409, detail="File not ready")
        filepath = info["filepath"]
    return FileResponse(path=filepath, filename=os.path.basename(filepath), media_type="application/octet-stream")

@router.post("/download", deprecated=True)
def download(url: str, format_id: str):
    outname = OUT_DIR / (f"{uuid.uuid4()}.%(ext)s")
    ydl_opts = {
        "format": format_id,
        "outtmpl": str(outname),
        "quiet": True,
    }
    with yt_dlp.YoutubeDL(cast(Any, ydl_opts)) as ydl:
        try:
            result = ydl.download([url])
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    files = list(OUT_DIR.glob("*"))
    if not files:
        raise HTTPException(500, "No output file")
    latest = max(files, key=lambda p: p.stat().st_mtime)
    return FileResponse(path=str(latest), filename=latest.name, media_type="application/octet-stream")