import os
import threading
from typing import Any, Dict, cast
from fastapi import BackgroundTasks, HTTPException
from fastapi.responses import FileResponse, JSONResponse

import yt_dlp
from pathlib import Path

from app.utils import make_key


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
                info["percent"] = 0
            info["status"] = "downloading"
        elif status == "finished":
            info["status"] = "finished"
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

def get_status(download_id: str):
    with progress_lock:
        info = progress_store.get(download_id)
        if not info:
            raise HTTPException(status_code=404, detail="Not found")
        return info


def start_stream(
    url,
    format_id: str,
    background_tasks: BackgroundTasks
):
    key = make_key(url, format_id)

    with progress_lock:
        info = progress_store.get(key)

        if info and info["status"] == "finished":
            return FileResponse(
                path=info["filepath"],
                filename=os.path.basename(info["filepath"]),
                media_type="application/octet-stream",
            )

        if info and info["status"] in {"queued", "downloading"}:
            return JSONResponse({
                "download_id": key,
                "status": info["status"],
                "percent": info["percent"],
            })

        if info and info["status"] == "error":
            raise HTTPException(500, info["error"])

        progress_store[key] = {
            "status": "queued",
            "percent": 0,
            "filepath": None,
            "error": None,
        }

        background_tasks.add_task(
            run_download_task,
            key,
            url,
            format_id
        )

        return JSONResponse({
            "download_id": key,
            "status": "queued",
            "percent": 0,
        })
