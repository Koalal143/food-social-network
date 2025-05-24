/**
 * Утилиты для работы с тегами и методами приготовления
 */

const COOKING_METHOD_PREFIX = 'method:';

/**
 * Разделяет массив тегов на обычные теги и методы приготовления
 * @param {Array} tags - массив тегов из API
 * @returns {Object} объект с разделенными тегами и методами
 */
export function separateTagsAndMethods(tags = []) {
    const regularTags = [];
    const cookingMethods = [];

    tags.forEach(tag => {
        const tagName = typeof tag === 'string' ? tag : tag.name;
        
        if (tagName.startsWith(COOKING_METHOD_PREFIX)) {
            // Убираем префикс и добавляем в методы приготовления
            cookingMethods.push(tagName.replace(COOKING_METHOD_PREFIX, ''));
        } else {
            // Добавляем в обычные теги
            regularTags.push(tagName);
        }
    });

    return {
        tags: regularTags,
        cookingMethods: cookingMethods
    };
}

/**
 * Объединяет теги и методы приготовления в один массив для отправки в API
 * @param {Array} tags - массив обычных тегов
 * @param {Array} cookingMethods - массив методов приготовления
 * @returns {Array} объединенный массив тегов для API
 */
export function combineTagsAndMethods(tags = [], cookingMethods = []) {
    const allTags = [
        ...tags.map(tag => ({ name: tag })),
        ...cookingMethods.map(method => ({ name: `${COOKING_METHOD_PREFIX}${method}` }))
    ];

    return allTags;
}

/**
 * Проверяет, является ли тег методом приготовления
 * @param {string|Object} tag - тег для проверки
 * @returns {boolean} true если это метод приготовления
 */
export function isCookingMethod(tag) {
    const tagName = typeof tag === 'string' ? tag : tag.name;
    return tagName.startsWith(COOKING_METHOD_PREFIX);
}

/**
 * Получает чистое имя тега без префикса
 * @param {string|Object} tag - тег
 * @returns {string} имя тега без префикса
 */
export function getCleanTagName(tag) {
    const tagName = typeof tag === 'string' ? tag : tag.name;
    return tagName.startsWith(COOKING_METHOD_PREFIX) 
        ? tagName.replace(COOKING_METHOD_PREFIX, '') 
        : tagName;
}

/**
 * Фильтрует теги по типу
 * @param {Array} tags - массив тегов
 * @param {string} type - тип фильтра: 'tags' или 'methods'
 * @returns {Array} отфильтрованный массив
 */
export function filterTagsByType(tags = [], type = 'tags') {
    if (type === 'methods') {
        return tags.filter(tag => isCookingMethod(tag)).map(tag => getCleanTagName(tag));
    } else {
        return tags.filter(tag => !isCookingMethod(tag)).map(tag => getCleanTagName(tag));
    }
}
