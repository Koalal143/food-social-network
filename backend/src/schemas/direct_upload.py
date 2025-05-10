from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class DirectUploadFields(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    bucket: str
    x_amz_algorithm: str = Field(alias="X-Amz-Algorithm")
    x_amz_credential: str = Field(alias="X-Amz-Credential")
    x_amz_date: str = Field(alias="X-Amz-Date")
    key: str
    policy: str
    x_amz_signature: str = Field(alias="X-Amz-Signature")


class DirectUpload(BaseModel):
    url: HttpUrl
    fields: DirectUploadFields
