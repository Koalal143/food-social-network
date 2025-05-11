from fastapi import HTTPException


class AppHTTPException(HTTPException):
    def __init__(
        self, status_code: int, error_key: str, detail: str | None = None, headers: dict[str, str] | None = None
    ) -> None:
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_key = error_key

    def __repr__(self) -> str:
        class_name = self.__class__.__name__
        return f"{class_name}(status_code={self.status_code!r}, detail={self.detail!r}, error_key={self.error_key!r})"
