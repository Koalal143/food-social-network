from src.exceptions.base import BaseAppError


class AnonymousUserDoesNotExistError(BaseAppError):
    error_key = "anonymous_user_does_not_exist"
