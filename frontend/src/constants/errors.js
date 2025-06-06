export const ERROR_MESSAGES = {
    // Общие ошибки
    validation_error: 'Ошибка в форме. Попробуйте заполнить ее заново',

    // Ошибки пользователя
    user_not_found: 'Пользователь не найден',
    user_nickname_already_exists: 'Пользователь с таким юзернеймом уже существует',
    user_email_already_exists: 'Пользователь с таким email уже существует',
    suspicious_email: 'Данный email помечен как подозрительный, попробуйте использовать другой',
    inactive_user: 'Аккаунт неактивен',
    incorrect_email_username_or_password: 'Неверный email/юзернейм или пароль',

    // Ошибки авторизации
    invalid_refresh_token: 'Что-то пошло не так, попробуйте перезайти в аккаунт',
    invalid_credentials: 'Что-то пошло не так, попробуйте перезайти в аккаунт',
    token_expired: 'Что-то пошло не так, попробуйте перезайти в аккаунт',
    invalid_token: 'Что-то пошло не так, попробуйте перезайти в аккаунт',
    not_authenticated: 'Необходима авторизация',
    insufficient_permissions: 'Недостаточно прав для выполнения действия',

    // Ошибки файлов
    unsupported_media_type: 'Неподдерживаемый формат файла. Разрешены только JPG, PNG и GIF',
    image_too_large: 'Размер изображения превышает 5MB',
    file_upload_failed: 'Не удалось загрузить файл',

    // Ошибки данных
    not_found: 'Данные не найдены',
    recipe_not_found: 'Рецепт не найден',
    recipe_belongs_to_other_user: 'У вас нет прав для удаления этого рецепта',
    instructions_required_to_publish: 'Рецепт не может быть опубликован без инструкций',
    image_required_to_publish: 'Рецепт не может быть опубликован без изображения',
    recipe_already_in_favorites: 'Рецепт уже в избранном',
    recipe_not_in_favorites: 'Рецепт не в избранном',
    recipe_already_disliked: 'Рецепт уже в списке нелюбимых',
    recipe_not_disliked: 'Рецепт не в списке нелюбимых',
    user_id_or_anonymous_user_id_not_provided: 'Не предоставлен user_id или anonymous_user_id',
    consent_not_found: 'Согласие не найдено',
    already_exists: 'Запись уже существует',
    invalid_request: 'Неверный запрос. Попробуйте позже',

    // Ошибки сервера
    internal_server_error: 'Внутренняя ошибка сервера. Попробуйте позже',
    service_unavailable: 'Сервис временно недоступен. Попробуйте позже',

    // Ошибки по умолчанию
    default: 'Произошла ошибка. Попробуйте позже',
    username_banned: 'Это имя пользователя запрещено к использованию',

    // Ошибки cookie consent
    cookie_consent_save_failed: 'Не удалось сохранить настройки cookies',
    cookie_consent_load_failed: 'Не удалось загрузить настройки cookies'
}