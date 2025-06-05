from argon2 import PasswordHasher
from argon2.exceptions import VerificationError


class SecurityService:
    hasher = PasswordHasher()

    @classmethod
    def verify_password(cls, plain_password: str, hashed_password: str) -> bool:
        try:
            return cls.hasher.verify(hashed_password, plain_password)
        except VerificationError:
            return False

    @classmethod
    def get_password_hash(cls, password: str) -> str:
        return cls.hasher.hash(password)
