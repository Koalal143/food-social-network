from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from src.core.security import CurrentUserDependency
from src.dependencies import S3StorageDependency, SessionDependency
from src.schemas import UserProfileRead, UserProfileUpdate, UserRead
from src.services import UserAvatarService, UserService

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


@router.patch(
    "/me/avatar",
    summary="Update user avatar",
    description="Updates the avatar of a user by their ID.",
)
async def update_user_avatar(
    image: Annotated[UploadFile, File()],
    current_user: CurrentUserDependency,
    session: SessionDependency,
    s3_storage: S3StorageDependency,
) -> dict[str, str]:
    if image is not None and (not image.content_type or not image.content_type.startswith("image/")):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported media type: should be image",
        )

    service = UserAvatarService(session, s3_storage)
    return {"avatar_url": await service.update_avatar(current_user.id, image)}


@router.delete(
    "/me/avatar",
    summary="Delete user avatar",
    description="Deletes the avatar of a user by their ID.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_user_avatar(
    current_user: CurrentUserDependency,
    session: SessionDependency,
    s3_storage: S3StorageDependency,
) -> None:
    service = UserAvatarService(session, s3_storage)
    await service.delete_avatar(current_user.id)
