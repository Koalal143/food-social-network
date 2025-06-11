from typing import Annotated

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, Depends, Path, Query, Response, status

from src.core.security import CurrentUserDependency, get_admin_or_higher, get_superuser
from src.db.uow import SQLAlchemyUnitOfWork
from src.enums.report_status import ReportStatusEnum
from src.exceptions import (
    AppHTTPException,
    CannotReportOwnRecipeError,
    RecipeNotFoundError,
    RecipeReportAlreadyExistsError,
    RecipeReportNotFoundError,
)
from src.models.user import User
from src.schemas.recipe_report import (
    RecipeReportAdminUpdate,
    RecipeReportCreate,
    RecipeReportRead,
)
from src.services.recipe_report import RecipeReportService
from src.utils.examples_factory import json_example_factory, json_examples_factory

router = APIRouter(
    route_class=DishkaRoute,
    prefix="/recipe-reports",
    tags=["Recipe Reports"],
)


@router.post(
    "",
    summary="Create recipe report",
    description="Create a new report for a recipe. Users cannot report their own recipes.",
    responses={
        status.HTTP_409_CONFLICT: {
            "content": json_examples_factory(
                {
                    "Recipe already reported": {
                        "value": {
                            "detail": "You have already reported recipe with id 123",
                            "error_key": "recipe_report_already_exists",
                        },
                    },
                    "Cannot report own recipe": {
                        "value": {
                            "detail": "Cannot report your own recipe",
                            "error_key": "cannot_report_own_recipe",
                        },
                    },
                },
            ),
        },
        status.HTTP_404_NOT_FOUND: {
            "content": json_example_factory(
                {
                    "detail": "Recipe with id 123 not found",
                    "error_key": "recipe_not_found",
                },
            ),
        },
    },
    status_code=status.HTTP_201_CREATED,
)
async def create_recipe_report(
    report_create: RecipeReportCreate,
    current_user: CurrentUserDependency,
    uow: FromDishka[SQLAlchemyUnitOfWork],
    recipe_report_service: FromDishka[RecipeReportService],
) -> RecipeReportRead:
    async with uow:
        try:
            report = await recipe_report_service.create_report(
                user=current_user,
                recipe_id=report_create.recipe_id,
                reason=report_create.reason.value,
                description=report_create.description,
            )
        except RecipeNotFoundError as e:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key
            ) from None
        except (RecipeReportAlreadyExistsError, CannotReportOwnRecipeError) as e:
            raise AppHTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e), error_key=e.error_key) from None
        else:
            await uow.commit()
            return report


@router.get(
    "/my",
    summary="Get my reports",
    description="Get all reports created by the current user with pagination.",
)
async def get_my_reports(
    current_user: CurrentUserDependency,
    recipe_report_service: FromDishka[RecipeReportService],
    response: Response,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
) -> list[RecipeReportRead]:
    total, reports = await recipe_report_service.get_user_reports(current_user, limit, offset)
    response.headers["X-Total-Count"] = str(total)
    return reports


@router.get(
    "",
    summary="Get all reports",
    description="Get all recipe reports with pagination and filtering. Admin access required.",
    dependencies=[Depends(get_admin_or_higher)],
)
async def get_all_reports(
    recipe_report_service: FromDishka[RecipeReportService],
    response: Response,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=50)] = 10,
    status_filter: Annotated[ReportStatusEnum | None, Query(alias="status")] = None,
) -> list[RecipeReportRead]:
    total, reports = await recipe_report_service.get_all_reports(limit, offset, status_filter)
    response.headers["X-Total-Count"] = str(total)
    return reports


@router.get(
    "/{report_id}",
    summary="Get report details (Admin)",
    description="Get detailed information about a specific report. Admin access required.",
    dependencies=[Depends(get_admin_or_higher)],
    responses={
        status.HTTP_404_NOT_FOUND: {
            "content": json_example_factory(
                {
                    "detail": "Recipe report with id 123 not found",
                    "error_key": "recipe_report_not_found",
                },
            ),
        },
    },
)
async def get_report_by_id(
    report_id: Annotated[int, Path(description="ID of the report")],
    recipe_report_service: FromDishka[RecipeReportService],
) -> RecipeReportRead:
    try:
        return await recipe_report_service.get_report_by_id(report_id)
    except RecipeReportNotFoundError as e:
        raise AppHTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key) from None


@router.patch(
    "/{report_id}",
    summary="Update report (Admin)",
    description="Update report status and add admin notes. Admin access required.",
    dependencies=[Depends(get_admin_or_higher)],
    responses={
        status.HTTP_404_NOT_FOUND: {
            "content": json_example_factory(
                {
                    "detail": "Recipe report with id 123 not found",
                    "error_key": "recipe_report_not_found",
                },
            ),
        },
    },
)
async def update_report(
    report_id: Annotated[int, Path(description="ID of the report")],
    report_update: RecipeReportAdminUpdate,
    current_admin: Annotated[User, Depends(get_admin_or_higher)],
    uow: FromDishka[SQLAlchemyUnitOfWork],
    recipe_report_service: FromDishka[RecipeReportService],
) -> RecipeReportRead:
    async with uow:
        try:
            report = await recipe_report_service.update_report_status(
                admin_user=current_admin,
                report_id=report_id,
                status=report_update.status,
                admin_notes=report_update.admin_notes,
            )
        except RecipeReportNotFoundError as e:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key
            ) from None
        else:
            await uow.commit()
            return report


@router.delete(
    "/{report_id}",
    summary="Delete report (Superuser)",
    description="Delete a recipe report. Superuser access required.",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(get_superuser)],
    responses={
        status.HTTP_404_NOT_FOUND: {
            "content": json_example_factory(
                {
                    "detail": "Recipe report with id 123 not found",
                    "error_key": "recipe_report_not_found",
                },
            ),
        },
    },
)
async def delete_report(
    report_id: Annotated[int, Path(description="ID of the report")],
    uow: FromDishka[SQLAlchemyUnitOfWork],
    recipe_report_service: FromDishka[RecipeReportService],
) -> None:
    async with uow:
        try:
            await recipe_report_service.delete_report(report_id)
        except RecipeReportNotFoundError as e:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key
            ) from None
        else:
            await uow.commit()
