# Руководство по деплою фронтенда

## Обзор

Этот документ описывает процесс деплоя оптимизированного продакшн образа фронтенда приложения food-social-network.

## Характеристики продакшн образа

- **Размер**: ~240MB (оптимизирован с помощью многоэтапной сборки)
- **Время запуска**: ~80ms (благодаря standalone сборке Next.js)
- **Безопасность**: Запуск от непривилегированного пользователя
- **Производительность**: Статические файлы и оптимизированный runtime

## Быстрый деплой

### Локальный деплой

```bash
# Сборка образа
docker build -t food-social-network-frontend:latest .

# Запуск контейнера
docker run -d -p 3000:3000 \
  --name frontend-prod \
  -e FRONTEND__API_URL=https://your-api-domain.com \
  -e FRONTEND__RECSYS_URL=https://your-recsys-domain.com \
  food-social-network-frontend:latest

# Проверка статуса
docker logs frontend-prod
```

### Docker Compose деплой

```bash
# Продакшн
docker-compose up -d

# Разработка
docker-compose -f docker-compose.dev.yml up -d
```

## Переменные окружения

### Обязательные переменные

```bash
# API endpoints
FRONTEND__API_URL=https://api.yourdomain.com
FRONTEND__RECSYS_URL=https://recsys.yourdomain.com

# Опционально: дополнительные настройки
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Пример .env файла для продакшна

```env
# API Configuration
FRONTEND__API_URL=https://api.production.com
FRONTEND__RECSYS_URL=https://recsys.production.com

# Security
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Optional: Custom port
PORT=3000
```

## Деплой на различных платформах

### Docker Swarm

```bash
# Создание service
docker service create \
  --name frontend \
  --publish 3000:3000 \
  --replicas 3 \
  --env FRONTEND__API_URL=https://api.yourdomain.com \
  --env FRONTEND__RECSYS_URL=https://recsys.yourdomain.com \
  food-social-network-frontend:latest
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: food-social-network-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: FRONTEND__API_URL
          value: "https://api.yourdomain.com"
        - name: FRONTEND__RECSYS_URL
          value: "https://recsys.yourdomain.com"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Cloud Platforms

#### AWS ECS

```json
{
  "family": "frontend-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "your-registry/food-social-network-frontend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "FRONTEND__API_URL",
          "value": "https://api.yourdomain.com"
        },
        {
          "name": "FRONTEND__RECSYS_URL",
          "value": "https://recsys.yourdomain.com"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## Мониторинг и логирование

### Health Check

```bash
# Проверка здоровья контейнера
docker inspect --format='{{.State.Health.Status}}' frontend-prod

# Ручная проверка
curl http://localhost:3000/api/health
```

### Логи

```bash
# Просмотр логов
docker logs -f frontend-prod

# С Docker Compose
docker-compose logs -f frontend
```

### Метрики

Приложение экспортирует метрики через:
- Next.js встроенную аналитику
- Логи доступа и ошибок
- Время ответа и использование ресурсов

## Обновление

### Rolling Update

```bash
# Сборка новой версии
docker build -t food-social-network-frontend:v2.0.0 .

# Обновление с нулевым downtime
docker service update \
  --image food-social-network-frontend:v2.0.0 \
  frontend
```

### Blue-Green Deployment

```bash
# Запуск новой версии на другом порту
docker run -d -p 3001:3000 \
  --name frontend-green \
  food-social-network-frontend:v2.0.0

# После тестирования - переключение трафика
# (через load balancer или reverse proxy)

# Остановка старой версии
docker stop frontend-blue
```

## Troubleshooting

### Частые проблемы

1. **Контейнер не запускается**
   ```bash
   docker logs frontend-prod
   ```

2. **Проблемы с переменными окружения**
   ```bash
   docker exec -it frontend-prod env
   ```

3. **Проблемы с сетью**
   ```bash
   docker exec -it frontend-prod wget -qO- http://localhost:3000
   ```

### Отладка

```bash
# Вход в контейнер
docker exec -it frontend-prod sh

# Проверка файлов
ls -la /app

# Проверка процессов
ps aux
```

## Безопасность

### Рекомендации

1. **Не запускайте от root** - образ использует непривилегированного пользователя
2. **Используйте HTTPS** - настройте SSL/TLS на reverse proxy
3. **Ограничьте ресурсы** - установите лимиты CPU и памяти
4. **Регулярно обновляйте** - следите за обновлениями безопасности

### Сканирование уязвимостей

```bash
# Сканирование образа
docker scout cves food-social-network-frontend:latest

# Или с помощью Trivy
trivy image food-social-network-frontend:latest
```

## Производительность

### Оптимизации

- Standalone сборка Next.js для быстрого запуска
- Многоэтапная сборка для минимального размера
- Кэширование слоев Docker
- Оптимизированные зависимости

### Мониторинг производительности

```bash
# Использование ресурсов
docker stats frontend-prod

# Детальная информация
docker exec frontend-prod cat /proc/meminfo
docker exec frontend-prod cat /proc/cpuinfo
```
