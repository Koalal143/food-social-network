import {
    RECIPE_TITLE_MIN_LENGTH,
    RECIPE_TITLE_MAX_LENGTH,
    RECIPE_TITLE_MAX_ONE_WORD_LENGTH,
    RECIPE_TITLE_MIN_WORDS,
    RECIPE_TITLE_MAX_WORDS,
    RECIPE_DESCRIPTION_MIN_LENGTH,
    RECIPE_DESCRIPTION_MAX_LENGTH,
    RECIPE_COOK_TIME_MIN,
    RECIPE_COOK_TIME_MAX,
    INGREDIENT_NAME_MIN_LENGTH,
    INGREDIENT_NAME_MAX_LENGTH,
    INGREDIENT_QUANTITY_MAX_LENGTH,
    INGREDIENTS_MIN_COUNT,
    INGREDIENTS_MAX_COUNT,
    INSTRUCTION_DESCRIPTION_MAX_LENGTH,
    INSTRUCTIONS_MAX_COUNT,
    TAG_NAME_MIN_LENGTH,
    TAG_NAME_MAX_LENGTH,
    TAGS_MIN_COUNT,
    TAGS_MAX_COUNT,
} from '@/constants/validation';

/**
 * Валидация названия рецепта
 * Синхронизировано с backend/src/utils/validators.py
 */
export const validateRecipeTitle = (value) => {
    if (!value) {
        return 'Название рецепта обязательно для заполнения';
    }

    const trimmed = value.trim();

    if (trimmed.length < RECIPE_TITLE_MIN_LENGTH) {
        return `Название должно содержать минимум ${RECIPE_TITLE_MIN_LENGTH} символа`;
    }

    if (trimmed.length > RECIPE_TITLE_MAX_LENGTH) {
        return `Название не должно превышать ${RECIPE_TITLE_MAX_LENGTH} символов`;
    }

    // Проверка количества слов
    const words = trimmed.split(/\s+/).filter(word => word.length > 0);

    if (words.length > RECIPE_TITLE_MAX_WORDS) {
        return `Название не должно содержать более ${RECIPE_TITLE_MAX_WORDS} слов`;
    }

    // Проверка на одно длинное слово
    if (words.length < RECIPE_TITLE_MIN_WORDS && trimmed.length > RECIPE_TITLE_MAX_ONE_WORD_LENGTH) {
        return `Название должно содержать минимум ${RECIPE_TITLE_MIN_WORDS} слова или быть короче ${RECIPE_TITLE_MAX_ONE_WORD_LENGTH} символов`;
    }

    return true;
};

/**
 * Валидация описания рецепта
 */
export const validateRecipeDescription = (value) => {
    if (!value) {
        return 'Описание рецепта обязательно для заполнения';
    }

    const trimmed = value.trim();
    
    if (trimmed.length < RECIPE_DESCRIPTION_MIN_LENGTH) {
        return `Описание должно содержать минимум ${RECIPE_DESCRIPTION_MIN_LENGTH} символа`;
    }
    
    if (trimmed.length > RECIPE_DESCRIPTION_MAX_LENGTH) {
        return `Описание не должно превышать ${RECIPE_DESCRIPTION_MAX_LENGTH} символов`;
    }

    return true;
};

/**
 * Валидация времени приготовления
 */
export const validateCookTime = (value) => {
    if (!value) {
        return 'Время приготовления обязательно для заполнения';
    }

    const num = Number(value);
    
    if (isNaN(num)) {
        return 'Время должно быть числом';
    }
    
    if (num < RECIPE_COOK_TIME_MIN) {
        return `Время должно быть больше ${RECIPE_COOK_TIME_MIN - 1} минут`;
    }
    
    if (num > RECIPE_COOK_TIME_MAX) {
        return `Время не должно превышать ${RECIPE_COOK_TIME_MAX} минут (24 часа)`;
    }

    return true;
};

/**
 * Валидация названия ингредиента
 */
export const validateIngredientName = (value) => {
    if (!value) {
        return 'Название ингредиента обязательно';
    }

    const trimmed = value.trim();
    
    if (trimmed.length < INGREDIENT_NAME_MIN_LENGTH) {
        return `Название должно содержать минимум ${INGREDIENT_NAME_MIN_LENGTH} символа`;
    }
    
    if (trimmed.length > INGREDIENT_NAME_MAX_LENGTH) {
        return `Название не должно превышать ${INGREDIENT_NAME_MAX_LENGTH} символов`;
    }

    return true;
};

/**
 * Валидация количества ингредиента
 */
export const validateIngredientQuantity = (value) => {
    if (!value) {
        return 'Количество ингредиента обязательно';
    }

    const trimmed = value.trim();
    
    if (trimmed.length > INGREDIENT_QUANTITY_MAX_LENGTH) {
        return `Количество не должно превышать ${INGREDIENT_QUANTITY_MAX_LENGTH} символов`;
    }

    return true;
};

/**
 * Валидация описания инструкции
 */
export const validateInstructionDescription = (value) => {
    if (!value) {
        return 'Описание шага обязательно';
    }

    const trimmed = value.trim();
    
    if (trimmed.length > INSTRUCTION_DESCRIPTION_MAX_LENGTH) {
        return `Описание шага не должно превышать ${INSTRUCTION_DESCRIPTION_MAX_LENGTH} символов`;
    }

    return true;
};

/**
 * Валидация тега
 */
export const validateTag = (tag, existingTags = []) => {
    if (!tag) {
        return 'Тег не может быть пустым';
    }

    const trimmed = tag.trim();
    
    if (trimmed.length < TAG_NAME_MIN_LENGTH) {
        return `Тег должен содержать минимум ${TAG_NAME_MIN_LENGTH} символа`;
    }
    
    if (trimmed.length > TAG_NAME_MAX_LENGTH) {
        return `Тег не должен превышать ${TAG_NAME_MAX_LENGTH} символов`;
    }

    if (existingTags.includes(trimmed)) {
        return 'Такой тег уже добавлен';
    }

    return true;
};

/**
 * Валидация массива тегов
 */
export const validateTags = (tags) => {
    if (!tags || tags.length < TAGS_MIN_COUNT) {
        return `Добавьте минимум ${TAGS_MIN_COUNT} тег`;
    }
    
    if (tags.length > TAGS_MAX_COUNT) {
        return `Максимум ${TAGS_MAX_COUNT} тегов`;
    }

    return true;
};

/**
 * Валидация массива ингредиентов
 */
export const validateIngredients = (ingredients) => {
    if (!ingredients || ingredients.length < INGREDIENTS_MIN_COUNT) {
        return `Добавьте минимум ${INGREDIENTS_MIN_COUNT} ингредиент`;
    }
    
    if (ingredients.length > INGREDIENTS_MAX_COUNT) {
        return `Максимум ${INGREDIENTS_MAX_COUNT} ингредиентов`;
    }

    return true;
};

/**
 * Валидация массива инструкций
 */
export const validateInstructions = (instructions) => {
    if (!instructions || instructions.length === 0) {
        return 'Добавьте минимум 1 шаг инструкции';
    }
    
    if (instructions.length > INSTRUCTIONS_MAX_COUNT) {
        return `Максимум ${INSTRUCTIONS_MAX_COUNT} шагов инструкции`;
    }

    return true;
};

/**
 * Получить правила валидации для react-hook-form
 */
export const getRecipeValidationRules = () => ({
    title: {
        validate: validateRecipeTitle,
    },
    short_description: {
        validate: validateRecipeDescription,
    },
    cook_time_minutes: {
        validate: validateCookTime,
    },
    ingredientName: {
        validate: validateIngredientName,
    },
    ingredientQuantity: {
        validate: validateIngredientQuantity,
    },
    instructionDescription: {
        validate: validateInstructionDescription,
    },
});

/**
 * Константы для использования в компонентах
 */
export const RECIPE_VALIDATION_CONSTANTS = {
    TITLE_MAX_LENGTH: RECIPE_TITLE_MAX_LENGTH,
    TITLE_MIN_LENGTH: RECIPE_TITLE_MIN_LENGTH,
    TITLE_MAX_WORDS: RECIPE_TITLE_MAX_WORDS,
    DESCRIPTION_MAX_LENGTH: RECIPE_DESCRIPTION_MAX_LENGTH,
    DESCRIPTION_MIN_LENGTH: RECIPE_DESCRIPTION_MIN_LENGTH,
    COOK_TIME_MAX: RECIPE_COOK_TIME_MAX,
    INGREDIENT_NAME_MAX_LENGTH: INGREDIENT_NAME_MAX_LENGTH,
    INGREDIENT_NAME_MIN_LENGTH: INGREDIENT_NAME_MIN_LENGTH,
    INGREDIENT_QUANTITY_MAX_LENGTH: INGREDIENT_QUANTITY_MAX_LENGTH,
    INSTRUCTION_DESCRIPTION_MAX_LENGTH: INSTRUCTION_DESCRIPTION_MAX_LENGTH,
    TAG_NAME_MAX_LENGTH: TAG_NAME_MAX_LENGTH,
    TAG_NAME_MIN_LENGTH: TAG_NAME_MIN_LENGTH,
    INGREDIENTS_MAX_COUNT: INGREDIENTS_MAX_COUNT,
    INSTRUCTIONS_MAX_COUNT: INSTRUCTIONS_MAX_COUNT,
    TAGS_MAX_COUNT: TAGS_MAX_COUNT,
};
