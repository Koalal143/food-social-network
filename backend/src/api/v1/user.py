from fastapi import APIRouter, HTTPException, status

from src.dependencies import CurrentUserDependency, SessionDependency
from src.schemas import UserProfileRead, UserProfileUpdate, UserRead
from src.services.user import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/{user_id}",
    summary="Get user by ID",
    description="Returns a user by their ID.",
)
async def get_user(user_id: int, session: SessionDependency) -> UserRead:
    service = UserService(session)
    user = await service.get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get(
    "/me/profile",
    summary="Get your profile",
    description="Returns the profile of the current user.",
)
async def get_my_profile(current_user: CurrentUserDependency, session: SessionDependency) -> UserProfileRead:
    service = UserService(session)
    return await service.get_profile(current_user.id)


@router.patch(
    "/me/profile",
    summary="Update your profile",
    description="Updates the profile of the current user.",
)
async def update_my_profile(
    update: UserProfileUpdate,
    current_user: CurrentUserDependency,
    session: SessionDependency,
) -> UserProfileRead:
    service = UserService(session)
    return await service.update_profile(current_user.id, about=update.about, avatar_url=update.avatar_url)
