/**
 * Утилиты для работы с валидацией
 * Универсальные функции для создания правил валидации
 *
 * ЛУЧШИЕ ПРАКТИКИ:
 *
 * 1. Используйте createValidationRule() для преобразования простых функций валидации
 *    в правила для ValidatedInput компонента
 *
 * 2. Функции валидации должны возвращать:
 *    - true при успешной валидации
 *    - строку с сообщением об ошибке при неуспешной валидации
 *
 * 3. Избегайте дублирования ValidationRules.required() если ваша кастомная функция
 *    уже проверяет на обязательность заполнения
 *
 * 4. Используйте ValidationRules.required() только для полей, которые не имеют
 *    дополнительной логики валидации
 */

/**
 * Создает правило валидации из функции валидации
 * @param {Function} validationFn - функция валидации, возвращающая true или строку ошибки
 * @returns {Object} правило валидации для ValidatedInput
 *
 * @example
 * const emailRule = createValidationRule((value) => {
 *   if (!value) return "Email обязателен";
 *   return /\S+@\S+\.\S+/.test(value) ? true : "Некорректный email";
 * });
 */
export const createValidationRule = (validationFn) => ({
    validate: async (value) => {
        const result = validationFn(value);
        return {
            isValid: result === true,
            message: result === true ? '' : result,
            severity: 'error'
        };
    }
});

/**
 * Создает массив правил валидации из функций валидации
 * @param {...Function} validationFns - функции валидации
 * @returns {Array} массив правил валидации для ValidatedInput
 *
 * @example
 * const passwordRules = createValidationRules(
 *   (value) => !value ? "Пароль обязателен" : true,
 *   (value) => value.length >= 8 ? true : "Минимум 8 символов"
 * );
 */
export const createValidationRules = (...validationFns) => {
    return validationFns.map(fn => createValidationRule(fn));
};
