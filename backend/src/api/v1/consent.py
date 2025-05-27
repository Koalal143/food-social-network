
from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, Response, status

from src.core.config import CookiePolicyConfig
from src.core.security import AnonymousUserOrNoneDependency
from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions import AppHTTPException
from src.schemas.consent import ConsentCreate, ConsentRead, ConsentUpdate
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


@router.post(
    "",
    summary="Create consent",
    description="Creates a new consent for anonymous user",
    status_code=status.HTTP_201_CREATED,
)
async def create_consent(
    consent_data: ConsentCreate,
    anonymous_user: AnonymousUserOrNoneDependency,
    consent_service: FromDishka[ConsentService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> ConsentRead:
    async with uow:
        consent = await consent_service.create(
            anonymous_user_id=anonymous_user.id,
            is_analytics_allowed=consent_data.is_analytics_allowed,
        )
        await uow.commit()
        return ConsentRead.model_validate(consent, from_attributes=True)


@router.put(
    "",
    summary="Update consent",
    description="Updates consent for the specified anonymous user and synchronizes analytics cookie",
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
async def update_consent(
    anonymous_user: AnonymousUserOrNoneDependency,
    consent_data: ConsentUpdate,
    response: Response,
    cookie_policy: FromDishka[CookiePolicyConfig],
    consent_service: FromDishka[ConsentService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> ConsentRead:
    async with uow:
        existing_consent = await consent_service.get_by_anonymous_user_id(anonymous_user.id)
        if not existing_consent:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Consent not found",
                error_key="consent_not_found",
            )

        updated_consent = await consent_service.update_analytics_consent(
            consent_id=existing_consent.id,
            is_analytics_allowed=consent_data.is_analytics_allowed,
        )

        if not updated_consent:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Consent not found",
                error_key="consent_not_found",
            )

        if consent_data.is_analytics_allowed:
            response.set_cookie(
                key="analytics_allowed",
                value="true",
                httponly=cookie_policy.httponly,
                secure=cookie_policy.secure,
                samesite=cookie_policy.samesite,
            )
        else:
            response.delete_cookie(key="analytics_allowed")

        await uow.commit()
        return ConsentRead.model_validate(updated_consent, from_attributes=True)
