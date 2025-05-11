from typing import Annotated

from pydantic import AfterValidator, Field

from src.schemas.base import BaseSchema


def check_dot_in_domain(domain: str) -> str:
    if "." not in domain:
        msg = "Email must contain a dot"
        raise ValueError(msg)
    return domain


class BaseBannedEmailDomain(BaseSchema):
    domain: Annotated[
        str,
        Field(min_length=1, examples=["gmail.com"]),
        AfterValidator(str.lower),
        AfterValidator(check_dot_in_domain),
    ]


class BannedEmailDomainRead(BaseBannedEmailDomain):
    pass


class BannedEmailDomainCreate(BaseBannedEmailDomain):
    pass
