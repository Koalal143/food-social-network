class BaseAppError(Exception):
    error_key: str

    def __init__(self, message: str) -> None:
        self.message = message
