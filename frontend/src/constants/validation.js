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

/**
 
 @param {string} username - Имя пользователя для проверки
 * @returns {boolean} true если username содержит запрещенный контент, false если допустим
 */
export const isBannedUsername = (username) => {
    if (!username || typeof username !== 'string') {
        return false;
    }

    const lowerUsername = username.toLowerCase();

    if (BANNED_USERNAMES.some(bannedName => lowerUsername === bannedName.toLowerCase())) {
        return true;
    }

    const additionalBannedPatterns = [
        /^(admin|administrator|root|moderator|support|help|owner|staff|avatar|me)\d*$/i, 
        /^(admin|administrator|root|moderator|support|help|owner|staff|avatar|me)[-_]/i, 
        /[-_](admin|administrator|root|moderator|support|help|owner|staff|avatar|me)$/i, 
        /^(test|demo|sample|example|null|undefined|anonymous|guest|user)$/i, 
        /^(api|www|mail|ftp|blog|shop|store|news|forum|chat)$/i, 
        /^(fuck|shit|damn|bitch|ass|sex|porn|xxx|666|hitler|nazi)$/i, 
    ];

    return additionalBannedPatterns.some(pattern => pattern.test(username));
};



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