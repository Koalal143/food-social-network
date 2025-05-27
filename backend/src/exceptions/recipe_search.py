from src.exceptions.base import BaseAppError


class UserIdentityNotProvidedError(BaseAppError):
    error_key = "user_id_or_anonymous_user_id_not_provided"
