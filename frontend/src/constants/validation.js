// === ПОЛЬЗОВАТЕЛИ ===
export const BANNED_USERNAMES = [
    "admin",
    "administrator",
    "root",
    "moderator",
    "support",
    "help",
    "owner",
    "staff",
    "avatar",
    "me",
];

export const BANNED_USERNAME_REGEX = new RegExp(
    BANNED_USERNAMES.map(name => `(${name})`).join('|'),
    'i'
);

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const PASSWORD_MIN_LENGTH = 8;

export const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

// === РЕЦЕПТЫ ===
// Синхронизировано с бэкендом (backend/src/schemas/recipe.py)

// Основные поля рецепта
export const RECIPE_TITLE_MIN_LENGTH = 3;
export const RECIPE_TITLE_MAX_LENGTH = 135;
export const RECIPE_TITLE_MAX_ONE_WORD_LENGTH = 25;
export const RECIPE_TITLE_MIN_WORDS = 2;
export const RECIPE_TITLE_MAX_WORDS = 15;

export const RECIPE_DESCRIPTION_MIN_LENGTH = 3;
export const RECIPE_DESCRIPTION_MAX_LENGTH = 255;

export const RECIPE_COOK_TIME_MIN = 1;
export const RECIPE_COOK_TIME_MAX = 1440; // 24 часа в минутах

// Ингредиенты
export const INGREDIENT_NAME_MIN_LENGTH = 2;
export const INGREDIENT_NAME_MAX_LENGTH = 135;
export const INGREDIENT_QUANTITY_MAX_LENGTH = 30;
export const INGREDIENTS_MIN_COUNT = 1;
export const INGREDIENTS_MAX_COUNT = 50;

// Инструкции (синхронизировано с MAX_RECIPE_INSTRUCTIONS_COUNT = 25)
export const INSTRUCTION_DESCRIPTION_MAX_LENGTH = 255;
export const INSTRUCTIONS_MAX_COUNT = 25;

// Теги
export const TAG_NAME_MIN_LENGTH = 2;
export const TAG_NAME_MAX_LENGTH = 50; // Синхронизировано с бэкендом
export const TAGS_MIN_COUNT = 1;
export const TAGS_MAX_COUNT = 15;