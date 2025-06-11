# Docker для фронтенда

Этот документ описывает, как использовать Docker для сборки и запуска фронтенда приложения.

## Файлы Docker

- `Dockerfile` - Оптимизированный многоэтапный Dockerfile для продакшна
- `Dockerfile.dev` - Dockerfile для разработки
- `docker-compose.yml` - Конфигурация для продакшна
- `docker-compose.dev.yml` - Конфигурация для разработки
- `.dockerignore` - Исключения для Docker контекста

## Быстрый старт

### Продакшн

```bash
# Сборка и запуск продакшн версии
docker-compose up --build

# Или пошагово:
docker build -t food-social-network-frontend:latest .
docker run -p 3000:3000 food-social-network-frontend:latest
```

### Разработка

```bash
# Сборка и запуск dev версии
docker-compose -f docker-compose.dev.yml up --build

# Или пошагово:
docker build -t food-social-network-frontend:dev -f Dockerfile.dev .
docker run -p 3000:3000 -v $(pwd):/app food-social-network-frontend:dev
```

## Особенности продакшн Dockerfile

### Многоэтапная сборка

1. **deps** - Установка только production зависимостей
2. **builder** - Установка всех зависимостей и сборка приложения
3. **runner** - Финальный минимальный образ с только необходимыми файлами

### Оптимизации

- Использование Node.js 20 Alpine для минимального размера
- Кэширование слоев Docker для ускорения повторных сборок
- Standalone сборка Next.js для автономного запуска
- Непривилегированный пользователь для безопасности
- Оптимизированный .dockerignore для исключения ненужных файлов

### Переменные окружения

Продакшн образ использует следующие переменные:

- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`
- `PORT=3000`
- `HOSTNAME=0.0.0.0`

## Команды Docker

### Сборка образов

```bash
# Продакшн образ
docker build -t food-social-network-frontend:latest .

# Dev образ
docker build -t food-social-network-frontend:dev -f Dockerfile.dev .

# Сборка с тегом версии
docker build -t food-social-network-frontend:v1.0.0 .
```

### Запуск контейнеров

```bash
# Продакшн
docker run -d -p 3000:3000 --name frontend-prod food-social-network-frontend:latest

# Разработка с volume
docker run -d -p 3000:3000 -v $(pwd):/app --name frontend-dev food-social-network-frontend:dev

# С переменными окружения
docker run -d -p 3000:3000 \
  -e FRONTEND__API_URL=https://api.example.com \
  -e FRONTEND__RECSYS_URL=https://recsys.example.com \
  food-social-network-frontend:latest
```

### Управление контейнерами

```bash
# Просмотр логов
docker logs frontend-prod

# Остановка
docker stop frontend-prod

# Удаление
docker rm frontend-prod

# Вход в контейнер
docker exec -it frontend-prod sh
```

### Docker Compose

```bash
# Запуск продакшн версии
docker-compose up -d

# Запуск dev версии
docker-compose -f docker-compose.dev.yml up -d

# Остановка
docker-compose down

# Пересборка и запуск
docker-compose up --build

# Просмотр логов
docker-compose logs -f frontend
```

## Размеры образов

Примерные размеры образов:

- **Продакшн образ**: ~150-200 MB (благодаря многоэтапной сборке)
- **Dev образ**: ~800-1000 MB (включает все зависимости)

## Troubleshooting

### Проблемы с сборкой

1. **Ошибка установки зависимостей**:
   ```bash
   # Очистите кэш npm
   docker build --no-cache .
   ```

2. **Проблемы с правами доступа**:
   ```bash
   # Проверьте, что файлы доступны для чтения
   ls -la
   ```

3. **Ошибки Next.js сборки**:
   ```bash
   # Проверьте логи сборки
   docker build . 2>&1 | tee build.log
   ```

### Проблемы с запуском

1. **Порт уже занят**:
   ```bash
   # Используйте другой порт
   docker run -p 3001:3000 food-social-network-frontend:latest
   ```

2. **Контейнер не отвечает**:
   ```bash
   # Проверьте health check
   docker inspect frontend-prod
   ```

## Переменные окружения

Для настройки приложения используйте переменные окружения с префиксом `FRONTEND__`:

```bash
# Пример для продакшна
docker run -p 3000:3000 \
  -e FRONTEND__API_URL=https://api.production.com \
  -e FRONTEND__RECSYS_URL=https://recsys.production.com \
  food-social-network-frontend:latest
```

## Health Check

Продакшн образ включает health check, который проверяет доступность приложения каждые 30 секунд.

```bash
# Проверка статуса health check
docker inspect --format='{{.State.Health.Status}}' frontend-prod
```
