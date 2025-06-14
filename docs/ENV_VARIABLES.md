# 🔧 Переменные окружения

Этот документ содержит полное описание всех переменных окружения, используемых в проекте "Вкусвайп". Переменные разделены по сервисам и категориям для удобства настройки и понимания архитектуры.

## 📋 Содержание

- [Backend API (API__)](#-backend-api-api)
  - [Настройки сервера](#настройки-сервера)
  - [База данных PostgreSQL](#база-данных-postgresql)
  - [Аутентификация JWT](#аутентификация-jwt)
  - [Политика Cookie](#политика-cookie)
  - [Хранилище S3/MinIO](#хранилище-s3minio)
  - [Кэширование Redis](#кэширование-redis)
  - [Поиск Elasticsearch](#поиск-elasticsearch)
  - [Брокер сообщений NATS](#брокер-сообщений-nats)
  - [Суперпользователь](#суперпользователь)
  - [Настройки тестирования](#настройки-тестирования)
  - [Настройки приложения](#настройки-приложения)
- [Рекомендательная система (RECSYS__)](#-рекомендательная-система-recsys)
  - [Внешние API](#внешние-api)
  - [База данных PostgreSQL](#база-данных-postgresql-1)
  - [Векторная база Qdrant](#векторная-база-qdrant)
  - [Брокер сообщений NATS](#брокер-сообщений-nats)
  - [FastStream ASGI](#faststream-asgi)
  - [Настройки приложения](#настройки-приложения-1)

## 🌐 Backend API (API__)

### Настройки сервера

#### `API__SERVER__URL`
- **Описание**: Базовый URL для API сервера
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**:
  - Development: `http://localhost`
  - Production: `https://api.vkusvayp.com`

#### `API__SERVER__HOST`
- **Описание**: IP адрес для привязки сервера
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `0.0.0.0`, `127.0.0.1`

#### `API__SERVER__PORT`
- **Описание**: Порт для запуска API сервера
- **Тип**: Число
- **Обязательность**: Обязательное
- **Примеры**: `8000`, `80`, `443`

#### `API__SERVER__ALLOWED_ORIGINS`
- **Описание**: Список разрешенных CORS origins в формате JSON
- **Тип**: JSON массив строк
- **Обязательность**: Обязательное
- **Примеры**:
  - Development: `["http://localhost:3000","http://localhost:8000"]`
  - Production: `["https://vkusvayp.com","https://api.vkusvayp.com"]`

### База данных PostgreSQL

#### `API__POSTGRES__USER`
- **Описание**: Имя пользователя PostgreSQL для API
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `postgres`, `api_user`, `food_app_user`

#### `API__POSTGRES__PASSWORD`
- **Описание**: Пароль пользователя PostgreSQL для API
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `secure_password_123`, `my_db_password`

#### `API__POSTGRES__HOST`
- **Описание**: Хост PostgreSQL сервера для API
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `api-db`, `localhost`, `postgres.example.com`

#### `API__POSTGRES__PORT`
- **Описание**: Порт PostgreSQL сервера для API
- **Тип**: Число
- **Обязательность**: Обязательное
- **Примеры**: `5432`, `5433`

#### `API__POSTGRES__DB`
- **Описание**: Имя базы данных для API
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `food_social_network`, `vkusvayp_db`

#### `API__POSTGRES__ECHO`
- **Описание**: Включение логирования SQL запросов SQLAlchemy
- **Тип**: Булево
- **Обязательность**: Необязательное
- **По умолчанию**: `false`
- **Примеры**: `true` (для отладки), `false` (для production)

### Аутентификация JWT

#### `API__JWT__SECRET_KEY`
- **Описание**: Секретный ключ для подписи JWT токенов
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `super-secret-key-2024`, `jwt-signing-key-production`
- **⚠️ Важно**: Используйте криптографически стойкий ключ в production!

#### `API__JWT__ALGORITHM`
- **Описание**: Алгоритм для подписи JWT токенов
- **Тип**: Строка
- **Обязательность**: Обязательное
- **По умолчанию**: `HS256`
- **Примеры**: `HS256`, `HS512`, `RS256`

#### `API__JWT__ACCESS_TOKEN_EXPIRE_MINUTES`
- **Описание**: Время жизни access токена в минутах
- **Тип**: Число
- **Обязательность**: Обязательное
- **По умолчанию**: `30`
- **Примеры**: `15` (высокая безопасность), `60` (удобство)

#### `API__JWT__REFRESH_TOKEN_EXPIRE_DAYS`
- **Описание**: Время жизни refresh токена в днях
- **Тип**: Число
- **Обязательность**: Обязательное
- **По умолчанию**: `7`
- **Примеры**: `7`, `30`, `90`

### Политика Cookie

#### `API__COOKIE_POLICY__SECURE`
- **Описание**: Требование HTTPS для передачи cookies
- **Тип**: Булево
- **Обязательность**: Необязательное
- **По умолчанию**: `false`
- **Примеры**: `true` (production), `false` (development)

#### `API__COOKIE_POLICY__HTTPONLY`
- **Описание**: Запрет доступа к cookies из JavaScript
- **Тип**: Булево
- **Обязательность**: Необязательное
- **По умолчанию**: `true`
- **Примеры**: `true` (безопасность), `false` (доступ из JS)

#### `API__COOKIE_POLICY__SAMESITE`
- **Описание**: Политика SameSite для cookies
- **Тип**: Строка
- **Обязательность**: Обязательное
- **По умолчанию**: `lax`
- **Примеры**: `strict`, `lax`, `none`

### Хранилище S3/MinIO

#### `API__S3_STORAGE__ENDPOINT_URL`
- **Описание**: URL эндпоинта S3-совместимого хранилища
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**:
  - MinIO: `http://minio:9000`
  - AWS S3: `https://s3.amazonaws.com`
  - Yandex Cloud: `https://storage.yandexcloud.net`

#### `API__S3_STORAGE__URL`
- **Описание**: Публичный URL для доступа к файлам
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**:
  - Development: `http://localhost:9000/static/`
  - Production: `https://cdn.vkusvayp.com/`

#### `API__S3_STORAGE__HOST`
- **Описание**: Хост S3 хранилища (дублирует endpoint_url)
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `http://minio:9000`, `https://s3.amazonaws.com`

#### `API__S3_STORAGE__PORT`
- **Описание**: Порт S3 хранилища
- **Тип**: Число
- **Обязательность**: Необязательное
- **Примеры**: `80`, `443`, `9000`

#### `API__S3_STORAGE__ACCESS_KEY`
- **Описание**: Access Key для доступа к S3 хранилищу
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `minioadmin`, `AKIAIOSFODNN7EXAMPLE`

#### `API__S3_STORAGE__SECRET_KEY`
- **Описание**: Secret Key для доступа к S3 хранилищу
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `minioadmin`, `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

### Кэширование Redis

#### `API__REDIS__HOST`
- **Описание**: Хост Redis сервера
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `redis`, `localhost`, `redis.example.com`

#### `API__REDIS__PORT`
- **Описание**: Порт Redis сервера
- **Тип**: Число
- **Обязательность**: Обязательное
- **Примеры**: `6379`, `6380`

### Поиск Elasticsearch

#### `API__ELASTICSEARCH__HOST`
- **Описание**: URL Elasticsearch сервера
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**:
  - Docker: `http://elasticsearch`
  - External: `https://elasticsearch.example.com`

#### `API__ELASTICSEARCH__PORT`
- **Описание**: Порт Elasticsearch сервера
- **Тип**: Число
- **Обязательность**: Обязательное
- **Примеры**: `9200`, `9201`

#### `API__ELASTICSEARCH__USER`
- **Описание**: Имя пользователя для Elasticsearch
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `elastic`, `search_user`

#### `API__ELASTICSEARCH__PASSWORD`
- **Описание**: Пароль пользователя Elasticsearch
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `secure_elastic_password`, `my_elastic_pass`

### Брокер сообщений NATS

#### `API__NATS__URL`
- **Описание**: URL NATS брокера сообщений в формате nats://{адрес_брокера}:{порт_брокера}
- **Тип**: Строка
- **Обязательность**: Обязательное
- **По умолчанию**: `nats://nats:4222`
- **Примеры**:
  - Docker: `nats://nats:4222`
  - External: `nats://nats.example.com:4222`

### Суперпользователь

#### `API__SUPERUSER__USERNAME`
- **Описание**: Имя пользователя для суперпользователя, создаваемого при инициализации приложения
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `vkuswipe_admin`
- **⚠️ Важно**: Используется для создания суперпользователя с полными правами доступа :
    admin,
    administrator,
    root,
    moderator
    support
    help
    owner
    staff
    avatar
    me

#### `API__SUPERUSER__EMAIL`
- **Описание**: Email адрес для суперпользователя
- **Тип**: Строка (валидный email)
- **Обязательность**: Обязательное
- **Примеры**: `admin@example.com`, `superuser@company.com`
- **⚠️ Важно**: Должен быть валидным email адресом

#### `API__SUPERUSER__PASSWORD`
- **Описание**: Пароль для суперпользователя
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `secure_admin_password_123`, `SuperSecurePass2024!`
- **⚠️ Важно**: Используйте сложный пароль в production! Пароль будет захеширован при создании пользователя

### Настройки тестирования

#### `API__TESTS__USE_REAL_RECS_MICROSERVICE`
- **Описание**: Использовать реальный микросервис рекомендаций в тестах
- **Тип**: Булево
- **Обязательность**: Необязательное
- **По умолчанию**: `false`
- **Примеры**: `true` (интеграционные тесты эндпоинта рекомендаций), `false` (остальные тесты)

### Настройки приложения

#### `API__MODE`
- **Описание**: Режим работы приложения
- **Тип**: Строка
- **Обязательность**: Необязательное
- **По умолчанию**: `prod`
- **Примеры**: `dev`, `prod`, `test`

#### `API__PROJECT_NAME`
- **Описание**: Название проекта для отображения в документации
- **Тип**: Строка
- **Обязательность**: Необязательное
- **По умолчанию**: `Food Social Network`
- **Примеры**: `Food Social Network`, `Вкусвайп API`

#### `API__PYTHONPATH`
- **Описание**: Путь к исходному коду Python
- **Тип**: Строка
- **Обязательность**: Необязательное
- **Примеры**: `./src`, `/app/src`

## 🤖 Рекомендательная система (RECSYS__)

### Внешние API

#### `RECSYS__GIGACHAT__API_KEY`
- **Описание**: API ключ для доступа к GigaChat для генерации эмбеддингов
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `gigachat_api_key_example_123`
- **⚠️ Важно**: Получите ключ в личном кабинете GigaChat

### База данных PostgreSQL

#### `RECSYS__POSTGRES__HOST`
- **Описание**: Хост PostgreSQL сервера для рекомендательной системы
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `recsys-db`, `localhost`, `postgres-recsys.example.com`

#### `RECSYS__POSTGRES__PORT`
- **Описание**: Порт PostgreSQL сервера для рекомендательной системы
- **Тип**: Число
- **Обязательность**: Обязательное
- **Примеры**: `5432`, `5433`

#### `RECSYS__POSTGRES__USER`
- **Описание**: Имя пользователя PostgreSQL для рекомендательной системы
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `postgres`, `recsys_user`

#### `RECSYS__POSTGRES__PASSWORD`
- **Описание**: Пароль пользователя PostgreSQL для рекомендательной системы
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `recsys_secure_password`, `my_recsys_pass`

#### `RECSYS__POSTGRES__DB`
- **Описание**: Имя базы данных для рекомендательной системы
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `recsys_db`, `recommendations_database`

#### `RECSYS__POSTGRES__ECHO`
- **Описание**: Включение логирования SQL запросов SQLAlchemy в recsys
- **Тип**: Булево
- **Обязательность**: Необязательное
- **По умолчанию**: `false`
- **Примеры**: `true` (для отладки), `false` (для production)

### Векторная база Qdrant

#### `RECSYS__QDRANT__HOST`
- **Описание**: Хост Qdrant векторной базы данных
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `qdrant`, `localhost`, `qdrant.example.com`

#### `RECSYS__QDRANT__PORT`
- **Описание**: Порт Qdrant векторной базы данных
- **Тип**: Число
- **Обязательность**: Обязательное
- **Примеры**: `6333`, `6334`

### Брокер сообщений NATS

#### `RECSYS__NATS__HOST`
- **Описание**: URL NATS брокера сообщений
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**:
  - Docker: `nats://nats`
  - External: `nats://nats.example.com`

#### `RECSYS__NATS__PORT`
- **Описание**: Порт NATS брокера сообщений
- **Тип**: Число
- **Обязательность**: Обязательное
- **Примеры**: `4222`, `4223`

### FastStream ASGI

#### `RECSYS__ASGI_FASTSTREAM__HOST`
- **Описание**: IP адрес для привязки FastStream ASGI сервера
- **Тип**: Строка
- **Обязательность**: Обязательное
- **Примеры**: `0.0.0.0`, `127.0.0.1`

#### `RECSYS__ASGI_FASTSTREAM__PORT`
- **Описание**: Порт для FastStream ASGI сервера (документация AsyncAPI)
- **Тип**: Число
- **Обязательность**: Обязательное
- **Примеры**: `8001`, `8002`

### Настройки приложения

#### `RECSYS__MODE`
- **Описание**: Режим работы рекомендательной системы
- **Тип**: Строка
- **Обязательность**: Необязательное
- **По умолчанию**: `prod`
- **Примеры**: `dev`, `prod`, `test`
