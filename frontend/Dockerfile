# Многоэтапная сборка для оптимизации размера образа

# Этап 1: Установка зависимостей
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копируем файлы зависимостей для кэширования слоев
COPY package.json package-lock.json* ./
RUN npm ci --only=production --frozen-lockfile && npm cache clean --force

# Этап 2: Сборка приложения
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем зависимости из предыдущего этапа
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./

# Устанавливаем dev зависимости для сборки
RUN npm ci --frozen-lockfile

# Копируем исходный код
COPY . .

# Устанавливаем переменные окружения для сборки
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Передаем переменные окружения для сборки Next.js
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_INTERNAL_API_URL
ARG NEXT_PUBLIC_S3_STORAGE_URL
ARG NEXT_PUBLIC_APP_MODE

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_INTERNAL_API_URL=$NEXT_PUBLIC_INTERNAL_API_URL
ENV NEXT_PUBLIC_S3_STORAGE_URL=$NEXT_PUBLIC_S3_STORAGE_URL
ENV NEXT_PUBLIC_APP_MODE=$NEXT_PUBLIC_APP_MODE

# Выполняем сборку
RUN npm run build

# Этап 3: Финальный runtime образ
FROM node:20-alpine AS runner
WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Копируем необходимые файлы из builder
COPY --from=builder /app/public ./public

# Копируем standalone сборку
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Переключаемся на непривилегированного пользователя
USER nextjs

EXPOSE 3000

# Запускаем приложение
CMD ["node", "server.js"]