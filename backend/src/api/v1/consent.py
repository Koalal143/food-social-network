from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, Request, Response, status

from src.core.config import Settings
from src.core.security import AnonymousUserOrNoneDependency
from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions import AppHTTPException
from src.schemas.anonymous_user import AnonymousUserCreate
from src.schemas.consent import ConsentCreate, ConsentRead
from src.services.anonymous_user import AnonymousUserService
from src.services.consent import ConsentService
from src.utils.examples_factory import json_example_factory

router = APIRouter(route_class=DishkaRoute, prefix="/consent", tags=["Consent"])


@router.get(
    "/me",
    summary="Get current anonymous user consent",
    description="Returns consent for the current anonymous user",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "content": json_example_factory(
                {
                    "detail": "Consent not found",
                    "error_key": "consent_not_found",
                },
            ),
        },
    },
)
async def get_my_consent(
    anonymous_user: AnonymousUserOrNoneDependency,
    consent_service: FromDishka[ConsentService],
) -> ConsentRead:
    if not anonymous_user:
        raise AppHTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anonymous user not found",
            error_key="anonymous_user_not_found",
        )

    consent = await consent_service.get_by_anonymous_user_id(anonymous_user.id)
    if not consent:
        raise AppHTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent not found",
            error_key="consent_not_found",
        )

    return ConsentRead.model_validate(consent, from_attributes=True)


def _set_cookie(settings: Settings, response: Response, key: str, value: str) -> None:
    response.set_cookie(
        key=key,
        value=value,
        httponly=settings.cookie_policy.httponly,
        secure=settings.cookie_policy.secure,
        samesite=settings.cookie_policy.samesite,
    )


@router.post(
    "",
    summary="Create consent",
    description="Creates a new consent for anonymous user",
    status_code=status.HTTP_201_CREATED,
)
async def create_consent(
    consent_data: ConsentCreate,
    anonymous_user_service: FromDishka[AnonymousUserService],
    consent_service: FromDishka[ConsentService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
    request: Request,
    response: Response,
    settings: FromDishka[Settings],
) -> dict[str, bool]:
    if request.cookies.get("anonymous_id") or "authorization" in request.headers:
        raise AppHTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Consent already exists",
            error_key="consent_already_exists",
        )

    async with uow:
        is_analytics_allowed = consent_data["is_analytics_allowed"] == "true"
        await uow.commit()
        _set_cookie(settings, response, "analytics_allowed", str(is_analytics_allowed))
        if is_analytics_allowed:
            anonymous_user = await anonymous_user_service.create(
                AnonymousUserCreate(user_agent=request.headers.get("user-agent"))
            )
            await consent_service.create(anonymous_user_id=anonymous_user.id, is_analytics_allowed=is_analytics_allowed)
            _set_cookie(settings, response, "anonymous_id", str(anonymous_user.cookie_id))

        return {"created": True}


@router.delete("/revoke", summary="Revoke consent for anonymous user", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_consent(
    anonymous_user: AnonymousUserOrNoneDependency,
    consent_service: FromDishka[ConsentService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
    response: Response,
    settings: FromDishka[Settings],
) -> None:
    if not anonymous_user:
        raise AppHTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anonymous user not found",
        )
    async with uow:
        await consent_service.delete_by_anonymous_user_id(anonymous_user.id)
        await uow.commit()
        response.delete_cookie(key="anonymous_id")
    _set_cookie(settings, response, "analytics_allowed", "False")
