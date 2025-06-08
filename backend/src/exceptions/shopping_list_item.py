from src.exceptions.base import BaseAppError


class ShoppingListItemNotFoundError(BaseAppError):
    error_key = "shopping_list_item_not_found"
