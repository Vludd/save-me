from fastapi import FastAPI, APIRouter
from fastapi.responses import RedirectResponse

from app.routes import router

app = FastAPI()

@app.get("/")
def root():
    return RedirectResponse("/docs", status_code=302)

app.include_router(router, prefix="/api")