from fastapi import APIRouter, HTTPException, status

from src.core.security import CurrentUserDependency
from src.db.manager import SessionDependency
from src.schemas import UserProfileRead, UserProfileUpdate, UserRead
from src.services.user import UserService

router = APIRouter(prefix="/users", tags=["Пользователи"])


@router.get(
    "/{user_id}",
    summary="Получить пользователя по ID",
    description="Возвращает пользователя по его ID.",
)
async def get_user(user_id: int, session: SessionDependency) -> UserRead:
    service = UserService(session)
    user = await service.get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")
    return user


@router.get(
    "/me/profile",
    summary="Получить свой профиль",
    description="Возвращает профиль текущего пользователя.",
)
async def get_my_profile(current_user: CurrentUserDependency, session: SessionDependency) -> UserProfileRead:
    service = UserService(session)
    profile = await service.get_profile(current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Профиль не найден")
    return profile


@router.patch(
    "/me/profile",
    summary="Обновить свой профиль",
    description="Обновляет профиль текущего пользователя.",
)
async def update_my_profile(
    update: UserProfileUpdate,
    current_user: CurrentUserDependency,
    session: SessionDependency,
) -> UserProfileRead:
    service = UserService(session)
    return await service.update_profile(current_user.id, about=update.about, avatar_url=update.avatar_url)
