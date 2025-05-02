from src.exceptions.base import BaseAppError


class WrongImageFormatError(BaseAppError):
    error_key = "wrong_image_format"


class ImageTooLargeError(BaseAppError):
    error_key = "image_too_large"
