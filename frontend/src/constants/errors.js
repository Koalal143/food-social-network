export const ERROR_MESSAGES = {
    // Общие ошибки
    validation_error: 'Ошибка валидации данных',
    
    // Ошибки пользователя
    user_not_found: 'Пользователь не найден',
    user_nickname_already_exists: 'Пользователь с таким именем уже существует',
    user_email_already_exists: 'Пользователь с таким email уже существует',
    suspicious_email: 'Данный email помечен как подозрительный',
    inactive_user: 'Аккаунт неактивен',
    incorrect_email_username_or_password: 'Неверный email/имя пользователя или пароль',
    
    // Ошибки авторизации
    invalid_refresh_token: 'Недействительный токен обновления',
    invalid_credentials: 'Неверные учетные данные',
    token_expired: 'Срок действия токена истек',
    invalid_token: 'Недействительный токен',
    not_authenticated: 'Необходима авторизация',
    insufficient_permissions: 'Недостаточно прав для выполнения действия',
    
    // Ошибки файлов
    unsupported_media_type: 'Неподдерживаемый формат файла. Разрешены только JPG, PNG и GIF',
    image_too_large: 'Размер изображения превышает 5MB',
    file_upload_failed: 'Не удалось загрузить файл',
    
    // Ошибки данных
    not_found: 'Данные не найдены',
    already_exists: 'Запись уже существует',
    invalid_request: 'Неверный запрос',
    
    // Ошибки сервера
    internal_server_error: 'Внутренняя ошибка сервера',
    service_unavailable: 'Сервис временно недоступен',
    
    // Ошибки по умолчанию
    default: 'Произошла ошибка. Попробуйте позже'
} 