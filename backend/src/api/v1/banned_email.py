from typing import Annotated

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, Depends, Query, Response, status

from src.core.security import get_superuser
from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions import AppHTTPException, EmailDomainAlreadyBannedError
from src.schemas.banned_email import (
    BannedEmailDomainCreate,
    BannedEmailDomainRead,
)
from src.services.banned_email import BannedEmailService
from src.utils.examples_factory import json_example_factory

router = APIRouter(
    route_class=DishkaRoute, prefix="/banned-emails", tags=["Banned Emails"], dependencies=[Depends(get_superuser)]
)


@router.post(
    "/",
    summary="Ban email domain",
)
async def create_banned_email_domain(
    banned_email_in: BannedEmailDomainCreate,
    service: FromDishka[BannedEmailService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> BannedEmailDomainRead:
    async with uow:
        try:
            result = await service.create_banned_email(banned_email_create=banned_email_in)
            await uow.commit()
        except EmailDomainAlreadyBannedError as e:
            raise AppHTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message, error_key=e.error_key) from e
        else:
            return result


@router.get(
    "/",
    summary="Get emails domain list",
    responses={
        status.HTTP_200_OK: {
            "content": json_example_factory(["example.com"]),
            "headers": {"X-Total-Count": {"description": "Count of total banned emails", "type": "integer"}},
        }
    },
)
async def get_all_banned_email_domains(
    service: FromDishka[BannedEmailService],
    response: Response,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[str]:
    count, banned_emails = await service.get_all_banned_emails(limit=limit, offset=offset)
    response.headers["X-Total-Count"] = str(count)
    return banned_emails


@router.get(
    "/check/{domain}",
    summary="Check is domain banned",
    responses={
        status.HTTP_200_OK: {
            "content": json_example_factory({"banned": True}),
        }
    },
)
async def get_banned_email_domain_by_name(
    domain: str,
    service: FromDishka[BannedEmailService],
) -> dict[str, bool]:
    return {"banned": await service.check_banned_email(domain=domain)}


@router.delete(
    "/{domain}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete email from ban list",
)
async def delete_banned_email_domain(
    domain: str,
    service: FromDishka[BannedEmailService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> None:
    async with uow:
        await service.delete_banned_email(domain=domain)
        await uow.commit()
