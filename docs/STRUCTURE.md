# 📁 Структура проекта

Платформа "Вкусвайп" построена на микросервисной архитектуре с четким разделением ответственности между компонентами. Ниже представлена детальная структура проекта с описанием назначения каждой директории и ключевых файлов.

## 🏗 Общая структура

```
food-social-network/
├── 📁 backend/                    # Backend API (FastAPI)
│   ├── 📁 src/
│   │   ├── 📁 api/               # API роутеры
│   │   │   └── 📁 v1/           # API версии 1
│   │   │       ├── auth.py      # Аутентификация
│   │   │       ├── users.py     # Пользователи
│   │   │       ├── recipes.py   # Рецепты
│   │   │       ├── recipe_search.py  # Поиск рецептов
│   │   │       ├── recommendations.py  # Рекомендации
│   │   │       ├── favorite_recipe.py  # Избранные рецепты
│   │   │       ├── disliked_recipe.py  # Дизлайки
│   │   │       ├── banned_email.py     # Заблокированные email
│   │   │       └── consent.py          # Согласия пользователей
│   │   ├── 📁 core/             # Основная конфигурация
│   │   │   ├── config.py        # Настройки приложения
│   │   │   ├── security.py      # Безопасность и JWT
│   │   │   ├── lifespan.py      # Жизненный цикл приложения
│   │   │   ├── exception_handlers.py  # Обработчики исключений
│   │   │   └── 📁 di/           # Dependency Injection
│   │   │       ├── container.py # DI контейнер
│   │   │       └── providers/   # DI провайдеры
│   │   ├── 📁 db/               # База данных
│   │   │   ├── 📁 models/       # SQLAlchemy модели
│   │   │   │   ├── user.py      # Модель пользователя
│   │   │   │   ├── recipe.py    # Модель рецепта
│   │   │   │   ├── ingredient.py # Модель ингредиента
│   │   │   │   └── ...
│   │   │   ├── database.py      # Подключение к БД
│   │   │   └── uow.py           # Unit of Work
│   │   ├── 📁 repositories/     # Репозитории для работы с данными
│   │   │   ├── 📁 interfaces/   # Интерфейсы репозиториев
│   │   │   ├── user.py          # Репозиторий пользователей
│   │   │   ├── recipe.py        # Репозиторий рецептов
│   │   │   ├── recsys_client.py # Клиент рекомендательной системы
│   │   │   └── ...
│   │   ├── 📁 services/         # Бизнес-логика
│   │   │   ├── user.py          # Сервис пользователей
│   │   │   ├── recipe.py        # Сервис рецептов
│   │   │   ├── search.py        # Сервис поиска
│   │   │   ├── recommendation.py # Сервис рекомендаций
│   │   │   └── ...
│   │   ├── 📁 schemas/          # Pydantic схемы
│   │   │   ├── user.py          # Схемы пользователей
│   │   │   ├── recipe.py        # Схемы рецептов
│   │   │   ├── token.py         # Схемы токенов
│   │   │   └── ...
│   │   ├── 📁 exceptions/       # Кастомные исключения
│   │   ├── 📁 utils/            # Утилиты и хелперы
│   │   ├── 📁 enums/            # Перечисления
│   │   └── main.py              # Точка входа FastAPI
│   ├── 📁 alembic/              # Миграции базы данных
│   │   ├── 📁 versions/         # Файлы миграций
│   │   ├── 📁 seed_data/        # Начальные данные
│   │   ├── env.py               # Конфигурация Alembic
│   │   └── script.py.mako       # Шаблон миграций
│   ├── 📁 docs/                 # Документация API
│   ├── Dockerfile               # Docker образ backend
│   ├── pyproject.toml           # Python зависимости и настройки
│   ├── alembic.ini              # Конфигурация Alembic
│   └── uv.lock                  # Lockfile зависимостей
│
├── 📁 recsys/                    # Рекомендательная система
│   ├── 📁 src/
│   │   ├── 📁 algorithms/       # RecSys алгоритмы
│   │   │   └── recommendation_algorithm.py  # Основной алгоритм рекомендаций
│   │   ├── 📁 core/             # Конфигурация
│   │   │   ├── config.py        # Настройки микросервиса
│   │   │   └── 📁 di/           # Dependency Injection (dishka)
│   │   ├── 📁 db/               # Модели базы данных
│   │   │   └── 📁 models/       # SQLAlchemy модели
│   │   │       ├── recipe.py    # Модель рецепта
│   │   │       ├── user_feedback.py  # Модель обратной связи
│   │   │       └── user_impression.py  # Модель просмотров
│   │   ├── 📁 repositories/     # Репозитории
│   │   │   ├── postgres.py      # PostgreSQL репозиторий
│   │   │   ├── qdrant.py        # Qdrant репозиторий
│   │   │   └── embeddings.py    # Репозиторий эмбеддингов
│   │   ├── 📁 services/         # Сервисы рекомендаций
│   │   │   └── recs_service.py  # Основной сервис рекомендаций
│   │   ├── 📁 schemas/          # Pydantic схемы
│   │   │   ├── recommendations.py  # Схемы рекомендаций
│   │   │   └── tasks.py         # Схемы задач
│   │   ├── 📁 tasks/            # FastStream задачи
│   │   │   ├── recommendations.py  # RPC рекомендации
│   │   │   ├── recipes.py       # Управление рецептами
│   │   │   ├── feedback.py      # Обратная связь
│   │   │   └── impressions.py   # Просмотры рецептов
│   │   ├── worker.py            # FastStream worker
│   │   └── create_qdrant_collection.py  # Инициализация Qdrant
│   ├── 📁 alembic/              # Миграции
│   │   ├── 📁 versions/         # Файлы миграций
│   │   └── env.py               # Конфигурация Alembic
│   ├── Dockerfile               # Docker образ recsys
│   ├── pyproject.toml           # Python зависимости
│   ├── alembic.ini              # Конфигурация Alembic
│   └── uv.lock                  # Lockfile зависимостей
│
├── 📁 scripts/                  # Скрипты для развертывания
│   └── database_init.sh         # Инициализация баз данных
│
├── 📁 elasticsearch_assets/     # Конфигурация Elasticsearch
│   ├── elasticsearch.yml        # Основная конфигурация
│   └── 📁 analysis/
│       └── recipe_synonyms.txt  # Синонимы для поиска рецептов
│
├── docker-compose.yml           # Основная конфигурация Docker
├── nginx.conf                   # Конфигурация Nginx
├── .env.example                 # Пример переменных окружения
├── README.md                    # Основная документация
├── 📁 docs/                     # Документация проекта
│   ├── STRUCTURE.md             # Структура проекта
│   ├── TECH_STACK.md            # Технологический стек
│   ├── ENV_VARIABLES.md         # Переменные окружения
│   ├── RECOMMENDATION_ALGORITHM.md  # Алгоритм рекомендаций
│   ├── DEVELOPMENT.md           # Руководство по разработке
│   └── 📁 assets/               # Ресурсы документации
│       ├── architecture.jpg     # Диаграмма архитектуры
│       └── main_page.png        # Скриншот главной страницы
```

## 🔧 Детальное описание компонентов

### 📱 Backend (FastAPI)

**Назначение**: Основной API сервер, обрабатывающий HTTP запросы и содержащий бизнес-логику приложения.

#### Ключевые директории:

- **`src/api/v1/`** - REST API endpoints, организованные по доменам
  - Каждый файл содержит роутеры для конкретной функциональности
  - Использует Dishka для dependency injection
  - Включает валидацию через Pydantic схемы

- **`src/core/`** - Основная конфигурация и инфраструктурный код
  - `config.py` - настройки через переменные окружения
  - `security.py` - JWT аутентификация и авторизация
  - `di/` - настройка dependency injection контейнера

- **`src/db/models/`** - SQLAlchemy ORM модели
  - Определяют структуру базы данных
  - Включают связи между таблицами
  - Используют современный declarative стиль SQLAlchemy 2.0

- **`src/repositories/`** - Слой доступа к данным
  - Абстрагируют работу с базой данных или адаптерами
  - Реализуют Repository Pattern
  - Включают интерфейсы для тестирования

- **`src/services/`** - Бизнес-логика приложения
  - Координируют работу между репозиториями
  - Содержат основную логику обработки данных
  - Интегрируются с внешними сервисами

#### Примеры ключевых файлов:

```python
# src/api/v1/recipes.py
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_recipe(
    recipe_data: RecipeCreate,
    current_user: CurrentUserDependency,
    recipe_service: FromDishka[RecipeService],
) -> RecipeRead:
    # Создание нового рецепта

# src/services/recipe.py
class RecipeService:
    async def create(self, user: User, recipe_create: RecipeCreate) -> Recipe:
        # Бизнес-логика создания рецепта
```


### 🤖 Recsys (Рекомендательная система)

**Назначение**: Микросервис для персонализированных рекомендаций.

#### Ключевые директории:

- **`src/algorithms/`** - Recsys алгоритмы
  - `recommendation_algorithm.py` - основной алгоритм с MMR
  - Векторные вычисления с NumPy
  - Работа с эмбеддингами

- **`src/tasks/`** - FastStream RPC endpoints
  - `recommendations.py` - получение рекомендаций
  - `recipes.py` - управление рецептами в векторной БД
  - `feedback.py` - обработка лайков/дизлайков

- **`src/repositories/`** - Репозитории для разных хранилищ
  - `qdrant.py` - работа с векторной базой данных
  - `postgres.py` - работа с реляционными данными
  - `embeddings.py` - генерация эмбеддингов через GigaChat

#### Примеры ключевых файлов:

```python
# src/algorithms/recommendation_algorithm.py
class RecommendationAlgorithm:
    async def get_recommendations(
        self, user_id: int, limit: int = 10
    ) -> list[dict]:
        # MMR алгоритм для рекомендаций

# src/tasks/recommendations.py
@router.subscriber("recsys.get_recommendations")
async def get_user_recommendations_rpc(
    message: GetRecommendationsRequest,
) -> list[RecommendationItem]:
    # RPC endpoint для получения рекомендаций
```

### 🗄️ Инфраструктурные компоненты

#### Docker и оркестрация

- **`docker-compose.yml`** - Основная конфигурация всех сервисов
  - Определяет сети между контейнерами
  - Настраивает volumes для персистентности данных
  - Включает health checks для зависимостей

- **`nginx.conf`** - Reverse proxy конфигурация
  - Маршрутизация запросов между сервисами
  - Статические файлы и кэширование

#### Базы данных и хранилища

- **PostgreSQL** - Две отдельные базы данных:
  - `food_social_network` - основные данные приложения
  - `recsys_db` - данные рекомендательной системы

- **Elasticsearch** - Полнотекстовый поиск
  - Индексы рецептов с анализаторами
  - Синонимы и морфологический анализ
  - Фасетный поиск по категориям

- **Qdrant** - Векторная база данных
  - Хранение эмбеддингов рецептов
  - Быстрый поиск похожих векторов
  - Метаданные для фильтрации

#### Скрипты и утилиты

- **`scripts/database_init.sh`** - Инициализация баз данных
  - Создание схем и применение миграций
  - Загрузка начальных данных
  - Настройка индексов Elasticsearch

## 🏛️ Ключевые особенности архитектуры

### Backend (FastAPI)

- **Onion Architecture** с разделением на слои
  - API роутеры
  - Business Logic Layer (services)
  - Data Access Layer (repositories)
  - Infrastructure Layer (adapters)

- **Dependency Injection** через Dishka
  - Автоматическое разрешение зависимостей
  - Легкое тестирование через моки
  - Конфигурация через провайдеры

- **Repository Pattern** для работы с данными
  - Абстракция над источниками данных
  - Единообразный интерфейс доступа
  - Возможность смены реализации

- **Unit of Work** для транзакций
  - Атомарность операций
  - Откат изменений при ошибках
  - Оптимизация запросов к БД

- **JWT аутентификация** с refresh токенами
  - Stateless аутентификация
  - Автоматическое обновление токенов
  - Безопасное хранение сессий

### Рекомендательная система

- **Векторный поиск** через Qdrant
  - Семантический поиск по эмбеддингам
  - Масштабируемость для больших объемов данных
  - Быстрые approximate nearest neighbor запросы

- **MMR алгоритм** для балансировки релевантности и разнообразия
  - Maximal Marginal Relevance
  - Избежание повторяющихся рекомендаций
  - Настраиваемый баланс через lambda параметр

- **Эмбеддинги** через GigaChat API
  - Семантическое представление рецептов
  - Учет контекста и смысла
  - Многоязычная поддержка

- **Асинхронная обработка** через NATS и FastStream
  - RPC паттерн для синхронных операций
  - Pub/Sub для событийной архитектуры
  - Надежная доставка сообщений

### Frontend

- **Server-Side Rendering** с Next.js
  - Улучшенное SEO
  - Быстрая первоначальная загрузка
  - Гидратация на клиенте

- **Компонентная архитектура** с переиспользуемыми UI компонентами
  - Модульность и переиспользование
  - Единообразный дизайн
  - Легкое тестирование компонентов

- **State Management** через TanStack Query
  - Автоматическое кэширование
  - Оптимистичные обновления
  - Синхронизация с сервером

### Межсервисное взаимодействие

- **NATS JetStream** для надежной доставки сообщений
  - Персистентность сообщений
  - At-least-once доставка
  - Replay возможности

- **Request-Reply паттерн** для синхронных операций
  - Получение рекомендаций
  - Обновление данных в реальном времени
  - Timeout и error handling

- **Event-driven архитектура** для асинхронных операций
  - Обновление индексов поиска
  - Пересчет рекомендаций
  - Аналитические события

---

Эта структура обеспечивает масштабируемость, поддерживаемость и четкое разделение ответственности между компонентами системы.
