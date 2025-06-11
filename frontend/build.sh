#!/bin/bash

# Скрипт для сборки и управления Docker образами фронтенда

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Функция помощи
show_help() {
    echo "Использование: $0 [КОМАНДА]"
    echo ""
    echo "Команды:"
    echo "  build-prod    Собрать продакшн образ"
    echo "  build-dev     Собрать dev образ"
    echo "  run-prod      Запустить продакшн контейнер"
    echo "  run-dev       Запустить dev контейнер"
    echo "  stop          Остановить все контейнеры"
    echo "  clean         Очистить неиспользуемые образы"
    echo "  logs          Показать логи контейнера"
    echo "  help          Показать эту справку"
}

# Функция для сборки продакшн образа
build_prod() {
    log "Сборка продакшн образа..."
    docker build -t food-social-network-frontend:latest -f Dockerfile .
    log "Продакшн образ собран успешно!"
}

# Функция для сборки dev образа
build_dev() {
    log "Сборка dev образа..."
    docker build -t food-social-network-frontend:dev -f Dockerfile.dev .
    log "Dev образ собран успешно!"
}

# Функция для запуска продакшн контейнера
run_prod() {
    log "Запуск продакшн контейнера..."
    docker-compose -f docker-compose.yml up -d
    log "Продакшн контейнер запущен на http://localhost:3000"
}

# Функция для запуска dev контейнера
run_dev() {
    log "Запуск dev контейнера..."
    docker-compose -f docker-compose.dev.yml up -d
    log "Dev контейнер запущен на http://localhost:3000"
}

# Функция для остановки контейнеров
stop_containers() {
    log "Остановка контейнеров..."
    docker-compose -f docker-compose.yml down 2>/dev/null || true
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    log "Контейнеры остановлены"
}

# Функция для очистки
clean() {
    log "Очистка неиспользуемых образов..."
    docker system prune -f
    log "Очистка завершена"
}

# Функция для показа логов
show_logs() {
    log "Показ логов..."
    if docker-compose -f docker-compose.yml ps | grep -q "frontend"; then
        docker-compose -f docker-compose.yml logs -f frontend
    elif docker-compose -f docker-compose.dev.yml ps | grep -q "frontend-dev"; then
        docker-compose -f docker-compose.dev.yml logs -f frontend-dev
    else
        warn "Контейнеры не запущены"
    fi
}

# Основная логика
case "${1:-help}" in
    build-prod)
        build_prod
        ;;
    build-dev)
        build_dev
        ;;
    run-prod)
        build_prod
        run_prod
        ;;
    run-dev)
        build_dev
        run_dev
        ;;
    stop)
        stop_containers
        ;;
    clean)
        clean
        ;;
    logs)
        show_logs
        ;;
    help|*)
        show_help
        ;;
esac
