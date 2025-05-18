from typing import Annotated

from fastapi import APIRouter, File, Path, Query, Response, UploadFile, status

from src.core.security import CurrentUserDependency, CurrentUserOrNoneDependency
from src.dependencies import S3StorageDependency, UnitOfWorkDependency
from src.exceptions import (
    AppHTTPException,
    UserEmailAlreadyExistsError,
    UserNicknameAlreadyExistsError,
    UserNotFoundError,
)
from src.exceptions.image import ImageTooLargeError, WrongImageFormatError
from src.models.user import User
from src.schemas import RecipeReadShort, UserRead, UserUpdate
from src.services import RecipeService, UserAvatarService, UserService
from src.utils.examples_factory import json_example_factory, json_examples_factory

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "/me",
    summary="Get current user",
    description="Returns current user",
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
async def get_current_user(
    uow: UnitOfWorkDependency, s3_client: S3StorageDependency, current_user: CurrentUserDependency
) -> UserRead:
    async with uow:
        service = UserService(uow=uow, s3_client=s3_client)
        try:
            user = await service.get(current_user.id)
        except UserNotFoundError as e:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key
            ) from None
        return user


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
async def get_user(user_id: int, uow: UnitOfWorkDependency, s3_client: S3StorageDependency) -> UserRead:
    async with uow:
        service = UserService(uow=uow, s3_client=s3_client)
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
    s3_client: S3StorageDependency,
) -> User:
    async with uow:
        service = UserService(uow=uow, s3_client=s3_client)
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


@router.get(
    "/{username}/recipes",
    summary="Get user's recipes",
    description="Returns a list of user's recipes with pagination. The total count of recipes is returned in the "
    "X-Total-Count header.",
)
async def get_user_recipes(  # noqa: PLR0913
    author_nickname: Annotated[str, Path(alias="username")],
    current_user: CurrentUserOrNoneDependency,
    uow: UnitOfWorkDependency,
    s3_storage: S3StorageDependency,
    response: Response,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
) -> list[RecipeReadShort]:
    recipe_service = RecipeService(uow=uow, s3_storage=s3_storage)
    total, recipes = await recipe_service.get_all_by_author_username(
        author_nickname=author_nickname, skip=offset, limit=limit, user_id=current_user.id if current_user else None,
    )
    response.headers["X-Total-Count"] = str(total)
    return list(recipes)
