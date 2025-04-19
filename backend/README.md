# Food Social Network

API для социальной сети, посвященной еде.

## Запуск проекта

### С помощью Docker
1. Сборка и запуск контейнеров:
    ```bash
    docker-compose up --build
    ```
2. Запуск контейнеров в фоновом режиме:
    ```bash
    docker-compose up -d
    ```

### Без Docker (для разработки)

1. Создайте виртуальное окружение:
    ```bash
    python -m venv venv
    source venv/bin/activate  # Linux/MacOS
    venv\Scripts\activate     # Windows
    ```

2. Установите зависимости:
    1. Для продакшн-среды:
        ```bash
        uv pip install .
        ```
    2. Для dev-среды:
        ```bash
        uv pip install . --group=dev
        ```
    3. Для тестов:
        ```bash
        uv pip install . --group=test
        ```
    

3. Запустите сервер:
    ```bash
    uvicorn src.main:app --reload
    ```

## Миграции

Для создания миграций используйте следующие команды:

```bash
# Автоматическая генерация миграции на основе моделей
alembic revision --autogenerate -m "Migration description"

# Применение миграций
alembic upgrade head

# Откат миграций
alembic downgrade -1
```

## API Документация

После запуска сервера документация доступна по адресам:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc