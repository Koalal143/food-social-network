# 👨‍💻 Руководство по разработке

Этот документ содержит подробные инструкции по настройке окружения разработки, инструментам качества кода и процессам разработки для проекта "Вкусвайп".

## 📋 Содержание

- [Настройка окружения разработки](#-настройка-окружения-разработки)
  - [Требования к системе](#требования-к-системе)
  - [Установка Python и UV](#установка-python-и-uv)
  - [Настройка проекта](#настройка-проекта)
  - [Настройка IDE](#настройка-ide)
- [Инструменты качества кода](#-инструменты-качества-кода)
  - [Ruff - линтер и форматтер](#ruff---линтер-и-форматтер)
  - [MyPy - проверка типов](#mypy---проверка-типов)
  - [Pre-commit хуки](#pre-commit-хуки)
  - [UV-sort - сортировка зависимостей](#uv-sort---сортировка-зависимостей)
- [Git workflow и конвенции](#-git-workflow-и-конвенции)
  - [Именование веток](#именование-веток)
  - [Формат коммитов](#формат-коммитов)

## 🛠 Настройка окружения разработки

### Требования к системе

#### Python версия
- **Backend**: Python 3.12+
- **Recsys**: Python 3.12+

#### Системные требования
- **Git** 2.30+
- **Docker** 20.10+ и **Docker Compose** 2.0+
- **UV** - современный менеджер пакетов Python
- Минимум **8GB RAM** для разработки

### Установка Python и UV

#### Установка UV (рекомендуемый способ)

```bash
# Linux/macOS
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Через pip
pip install uv
```

### Настройка проекта

#### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd food-social-network
```

#### 2. Настройка Backend

```bash
cd backend

# Создание виртуального окружения
uv venv

# Активация окружения
source .venv/bin/activate  # Linux/macOS
.venv\Scripts\activate     # Windows

# Установка зависимостей для разработки
uv sync --group dev --group test

# Установка pre-commit хуков
pre-commit install
```

#### 3. Настройка Recsys

```bash
cd ../recsys

# Создание виртуального окружения
uv venv

# Активация окружения
source .venv/bin/activate  # Linux/macOS
.venv\Scripts\activate     # Windows

# Установка зависимостей для разработки
uv sync --group dev
```

### Настройка IDE

#### VS Code (рекомендуемые расширения)

Создайте файл `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.mypy-type-checker",
    "charliermarsh.ruff",
    "ms-python.black-formatter",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss"
  ]
}
```

#### Настройки VS Code

Создайте файл `.vscode/settings.json`:

```json
{
  "python.defaultInterpreterPath": "./backend/.venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.mypyEnabled": true,
  "python.formatting.provider": "none",
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.ruff": "explicit",
      "source.organizeImports.ruff": "explicit"
    }
  },
  "ruff.lint.args": ["--config=pyproject.toml"],
  "ruff.format.args": ["--config=pyproject.toml"]
}
```

## 🔧 Инструменты качества кода

### Ruff - линтер и форматтер

**Ruff** - современный, быстрый линтер и форматтер для Python, заменяющий множество инструментов.

#### Команды Ruff

```bash
# Проверка кода
ruff check .

# Автоматическое исправление
ruff check . --fix

# Форматирование кода
ruff format .

# Проверка и форматирование
ruff check . --fix && ruff format .
```

### MyPy - проверка типов

**MyPy** обеспечивает статическую проверку типов для повышения надежности кода.


## 🌿 Git workflow и конвенции

### Именование веток

Используйте следующие префиксы для веток:

```bash
# Новая функциональность
feature/user-authentication
feature/recipe-recommendations
feature/search-filters

# Исправление багов
fix/login-validation
fix/recipe-upload-error

# Критические исправления
hotfix/security-vulnerability
hotfix/database-connection

# Рефакторинг
refactor/user-service-cleanup
refactor/database-models

# Документация
docs/api-documentation
docs/deployment-guide
```

### Формат коммитов

Используйте **Conventional Commits** формат:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Типы коммитов

- **feat**: новая функциональность
- **fix**: исправление бага
- **docs**: изменения в документации
- **style**: форматирование, отсутствующие точки с запятой и т.д.
- **refactor**: рефакторинг кода
- **test**: добавление тестов
- **chore**: обновление задач сборки, настроек и т.д.
