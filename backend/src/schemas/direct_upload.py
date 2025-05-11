from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class DirectUploadFields(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    aws_access_key_id: str = Field(alias="AWSAccessKeyId")
    key: str
    policy: str
    signature: str


class DirectUpload(BaseModel):
    url: HttpUrl
    fields: DirectUploadFields
