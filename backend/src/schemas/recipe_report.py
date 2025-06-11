from pydantic import BaseModel, ConfigDict, Field

from src.enums.report_reason import ReportReasonEnum
from src.enums.report_status import ReportStatusEnum
from src.schemas.base import BaseReadSchema, BaseSchema
from src.schemas.recipe import RecipeShort
from src.schemas.user import UserReadShort


class RecipeReportCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

    recipe_id: int = Field(description="ID of the recipe being reported")
    reason: ReportReasonEnum = Field(description="Reason for the report")
    description: str | None = Field(None, max_length=500, description="Additional description of the report (optional)")


class RecipeReportRead(BaseReadSchema):
    recipe: RecipeShort = Field(description="Recipe information")
    reporter_user_id: int | None = Field(None, description="ID of the user who submitted the report")
    reason: ReportReasonEnum = Field(description="Reason for the report")
    description: str | None = Field(None, description="Report description")
    status: ReportStatusEnum = Field(description="Report review status")
    reviewed_by_user_id: int | None = Field(None, description="ID of the administrator who reviewed the report")
    admin_notes: str | None = Field(None, description="Administrator notes")

    reporter_user: UserReadShort | None = Field(None, description="Information about the user who submitted the report")
    reviewed_by_user: UserReadShort | None = Field(None, description="Information about the administrator")


class RecipeReportUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

    status: ReportStatusEnum = Field(description="New report status")


class RecipeReportAdminUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

    status: ReportStatusEnum | None = Field(None, description="New report status")
    admin_notes: str | None = Field(None, max_length=1000, description="Administrator notes")


class RecipeReportStats(BaseSchema):
    total_reports: int = Field(description="Total number of reports")
    pending_reports: int = Field(description="Number of pending reports")
    reviewed_reports: int = Field(description="Number of reviewed reports")
    resolved_reports: int = Field(description="Number of resolved reports")
    dismissed_reports: int = Field(description="Number of dismissed reports")
    reports_by_reason: dict[str, int] = Field(description="Statistics by report reason")
