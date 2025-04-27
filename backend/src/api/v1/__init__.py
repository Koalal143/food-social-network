from fastapi import APIRouter

from src.api.v1 import auth, user

router = APIRouter(prefix="/v1")

router.include_router(auth.router)
router.include_router(user.router)

__all__ = ["router"]
