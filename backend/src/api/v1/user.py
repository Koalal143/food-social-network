from typing import Annotated

from fastapi import APIRouter, File, UploadFile, status

from src.core.security import CurrentUserDependency
from src.dependencies import S3StorageDependency, UnitOfWorkDependency
from src.exceptions import (
    AppHTTPException,
    UserEmailAlreadyExistsError,
    UserNicknameAlreadyExistsError,
    UserNotFoundError,
)
from src.exceptions.image import ImageTooLargeError, WrongImageFormatError
from src.models.user import User
from src.schemas import UserRead, UserUpdate
from src.services import UserAvatarService, UserService
from src.utils import json_example_factory, json_examples_factory

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "/{user_id}",
    summary="Get user by ID",
    description="Returns a user by their ID.",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "content": json_example_factory(
                {
                    "detail": "User not found",
                    "error_key": "user_not_found",
                },
            ),
        },
    },
)
async def get_user(user_id: int, uow: UnitOfWorkDependency) -> UserRead:
    async with uow:
        service = UserService(uow=uow)
        try:
            user = await service.get(user_id)
        except UserNotFoundError as e:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key
            ) from None
        return user


@router.patch(
    "/me",
    summary="Update current user",
    description="Updates the current user's information including profile. Only username and profile can be updated.",
    response_model=UserRead,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "content": json_example_factory(
                {
                    "detail": "User not found",
                    "error_key": "user_not_found",
                },
            ),
        },
        status.HTTP_409_CONFLICT: {
            "content": json_examples_factory(
                {
                    "User nickname already exists": {
                        "value": {
                            "detail": "User nickname already exists",
                            "error_key": "user_nickname_already_exists",
                        },
                    },
                    "User email already exists": {
                        "value": {
                            "detail": "User email already exists",
                            "error_key": "user_email_already_exists",
                        },
                    },
                },
            ),
        },
    },
)
async def update_current_user(
    update: UserUpdate,
    current_user: CurrentUserDependency,
    uow: UnitOfWorkDependency,
) -> User:
    async with uow:
        service = UserService(uow=uow)
        try:
            return await service.update(
                current_user.id,
                username=update.username,
                profile=update.profile,
            )
        except UserNotFoundError as e:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key
            ) from None
        except (UserNicknameAlreadyExistsError, UserEmailAlreadyExistsError) as e:
            raise AppHTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e), error_key=e.error_key) from None


@router.patch(
    "/me/avatar",
    summary="Update user avatar",
    description="Updates the avatar of the current user.",
    responses={
        status.HTTP_200_OK: {
            "content": json_example_factory(
                {
                    "avatar_url": "https://example.com/avatar.png",
                },
            ),
        },
        status.HTTP_415_UNSUPPORTED_MEDIA_TYPE: {
            "content": json_example_factory(
                {
                    "detail": "Unsupported media type",
                    "error_key": "unsupported_media_type",
                },
            ),
        },
        status.HTTP_413_REQUEST_ENTITY_TOO_LARGE: {
            "content": json_example_factory(
                {
                    "detail": "Image too large",
                    "error_key": "image_too_large",
                },
            ),
        },
    },
)
async def update_user_avatar(
    image: Annotated[UploadFile, File()],
    current_user: CurrentUserDependency,
    uow: UnitOfWorkDependency,
    s3_storage: S3StorageDependency,
) -> dict[str, str]:
    async with uow:
        try:
            service = UserAvatarService(uow=uow, s3_client=s3_storage)
            avatar_url = await service.update_avatar(current_user.id, image)
        except WrongImageFormatError as e:
            raise AppHTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail=str(e), error_key=e.error_key
            ) from None
        except ImageTooLargeError as e:
            raise AppHTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=str(e), error_key=e.error_key
            ) from None
        else:
            return {"avatar_url": avatar_url}


@router.delete(
    "/me/avatar",
    summary="Delete user avatar",
    description="Deletes the avatar of the current user.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_user_avatar(
    current_user: CurrentUserDependency,
    uow: UnitOfWorkDependency,
    s3_storage: S3StorageDependency,
) -> None:
    async with uow:
        service = UserAvatarService(uow=uow, s3_client=s3_storage)
        await service.delete_avatar(current_user.id)
