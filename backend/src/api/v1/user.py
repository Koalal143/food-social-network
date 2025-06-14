from collections.abc import Sequence
from typing import Annotated

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, Depends, File, Path, Query, Response, UploadFile, status

from src.core.security import CurrentUserDependency, CurrentUserOrNoneDependency, get_superuser
from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions import (
    AppHTTPException,
    InsufficientRoleError,
    UserEmailAlreadyExistsError,
    UserNicknameAlreadyExistsError,
    UserNotFoundError,
)
from src.exceptions.image import ImageTooLargeError, WrongImageFormatError
from src.models.user import User
from src.schemas import RecipeReadShort, UserRead, UserRoleUpdate, UserUpdate
from src.services import RecipeService, UserAvatarService, UserService
from src.utils.examples_factory import json_example_factory, json_examples_factory

router = APIRouter(
    route_class=DishkaRoute,
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
    current_user: CurrentUserDependency,
    user_service: FromDishka[UserService],
) -> UserRead:
    try:
        user = await user_service.get(current_user.id)
    except UserNotFoundError as e:
        raise AppHTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key) from None
    return user


@router.get(
    "/{username}",
    summary="Get user by username",
    description="Returns a user by their username.",
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
async def get_user(
    username: str,
    user_service: FromDishka[UserService],
) -> UserRead:
    try:
        user = await user_service.get_by_username(username)
    except UserNotFoundError as e:
        raise AppHTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key) from None
    return user


@router.patch(
    "/me",
    summary="Update current user",
    description="Updates the current user's information including profile. Only username and profile can be updated.",
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
    uow: FromDishka[SQLAlchemyUnitOfWork],
    current_user: CurrentUserDependency,
    user_service: FromDishka[UserService],
) -> UserRead:
    async with uow:
        try:
            user = await user_service.update(
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
        else:
            await uow.commit()
            return user


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
    uow: FromDishka[SQLAlchemyUnitOfWork],
    user_avatar_service: FromDishka[UserAvatarService],
) -> dict[str, str]:
    async with uow:
        try:
            avatar_url = await user_avatar_service.update_avatar(current_user.id, image)
        except WrongImageFormatError as e:
            raise AppHTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail=str(e), error_key=e.error_key
            ) from None
        except ImageTooLargeError as e:
            raise AppHTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=str(e), error_key=e.error_key
            ) from None
        else:
            await uow.commit()
            return {"avatar_url": avatar_url}


@router.delete(
    "/me/avatar",
    summary="Delete user avatar",
    description="Deletes the avatar of the current user.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_user_avatar(
    current_user: CurrentUserDependency,
    user_avatar_service: FromDishka[UserAvatarService],
) -> None:
    await user_avatar_service.delete_avatar(current_user.id)


@router.get(
    "/me/recipes",
    summary="Get user's recipes",
    description=(
        "Returns a list of current user's recipes with pagination. The total count of recipes is returned in the "
        "X-Total-Count header."
    ),
    response_model=list[RecipeReadShort],
)
async def get_current_user_recipes(
    current_user: CurrentUserDependency,
    recipe_service: FromDishka[RecipeService],
    response: Response,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
) -> Sequence[RecipeReadShort]:
    total, recipes = await recipe_service.get_all_by_author_id(
        author_id=current_user.id,
        skip=offset,
        limit=limit,
        user_id=current_user.id if current_user else None,
    )
    response.headers["X-Total-Count"] = str(total)
    return recipes


@router.get(
    "/{username}/recipes",
    summary="Get user's recipes by username",
    description="Returns a list of user's recipes with pagination. The total count of recipes is returned in the "
    "X-Total-Count header.",
)
async def get_user_recipes(
    author_nickname: Annotated[str, Path(alias="username")],
    current_user: CurrentUserOrNoneDependency,
    recipe_service: FromDishka[RecipeService],
    response: Response,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
) -> list[RecipeReadShort]:
    total, recipes = await recipe_service.get_all_by_author_username(
        author_nickname=author_nickname,
        skip=offset,
        limit=limit,
        user_id=current_user.id if current_user else None,
    )
    response.headers["X-Total-Count"] = str(total)
    return list(recipes)


@router.patch(
    "/{user_id}/role",
    summary="Update user role",
    description="Updates the role of a user. Only accessible by superusers.",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "content": json_example_factory(
                {
                    "detail": "User not found",
                    "error_key": "user_not_found",
                },
            ),
        },
        status.HTTP_403_FORBIDDEN: {
            "content": json_examples_factory(
                {
                    "Not a superuser": {
                        "value": {
                            "detail": "The user doesn't have enough privileges",
                            "error_key": "not_enough_perms",
                        },
                    },
                    "Service-level role check": {
                        "value": {
                            "detail": "Role management requires superuser privileges",
                            "error_key": "insufficient_role",
                        },
                    },
                },
            ),
        },
    },
)
async def update_user_role(
    user_id: Annotated[int, Path(description="ID of the user to update")],
    role_update: UserRoleUpdate,
    current_user: Annotated[User, Depends(get_superuser)],
    uow: FromDishka[SQLAlchemyUnitOfWork],
    user_service: FromDishka[UserService],
) -> UserRead:
    async with uow:
        try:
            user = await user_service.update_role(user_id, role_update.role, current_user)
        except UserNotFoundError as e:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key
            ) from None
        except InsufficientRoleError as e:
            raise AppHTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail=str(e), error_key=e.error_key
            ) from None
        else:
            await uow.commit()
            return user
