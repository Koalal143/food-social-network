from fastapi import APIRouter

from src.api.v1 import auth, banned_email, user

router = APIRouter(prefix="/v1")

router.include_router(auth.router)
router.include_router(user.router)
router.include_router(banned_email.router)

__all__ = ["router"]
