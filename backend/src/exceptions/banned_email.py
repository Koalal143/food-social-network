from src.exceptions.base import BaseAppError


class EmailDomainAlreadyBannedError(BaseAppError):
    error_key = "email_domain_already_banned"
