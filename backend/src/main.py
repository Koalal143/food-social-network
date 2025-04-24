from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api import v1_router
from src.core.config import settings

app = FastAPI(
    title=settings.project_name,
    description="API for Food Social Network",
    version="1.0.0",
    debug=settings.mode == "dev",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.server.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router)
