# Календарь 📅

Система планирования задач для корпоративного использования командой разработчиков.

---

## 🚀 Быстрый старт

### Требования
- Node.js (версия 20.0 или выше)
- yarn (версия 1.22.22 или выше)
- Python (версия 3.12.3 или выше)
- PostgreSQL (версия 16 или выше)

---

## 🛠 Технологический стек

### Бэкенд
- ⚡ [FastAPI](https://fastapi.tiangolo.com) - высокопроизводительный фреймворк для создания API
- 🧰 [SQLModel](https://sqlmodel.tiangolo.com) - современный ORM с поддержкой Pydantic и SQLAlchemy
- 🔍 [Pydantic](https://docs.pydantic.dev) - валидация данных и управление настройками
- 💾 [PostgreSQL](https://www.postgresql.org/) - реляционная база данных
- 🐘 [Alembic](https://alembic.sqlalchemy.org) - система миграций базы данных
- 🔒 [JWT](https://jwt.io/)-аутентификация
- 🧪 [Pytest](https://pytest.org) - тестирование кода

### Фронтенд
- ⚛️ [React](https://react.dev) - библиотека для построения пользовательских интерфейсов
- 💅 [TypeScript](https://www.typescriptlang.org) - статическая типизация
- 🚀 [Vite](https://vitejs.dev) - сборка и горячая перезагрузка
- 🎨 [Chakra UI](https://chakra-ui.com) - компонентная библиотека
- 📦 [Webpack](https://webpack.js.org/) - бандлинг ассетов
---

## 🖥 Установка и запуск


1. **Клонировать репозиторий**  
   ```bash
   $ git clone https://github.com/10xtheo/is-practice-2025
    ```
    ```bash
    $ cd /is-practice-2025
    ```
## ⚙ Установка и запуск фронтенда 
1. **Установить зависимости**
    ```bash
    $ cd frontend/
    $ yarn install
    ```
2. **(Опционально) Собрать проект**
    ```bash
    $ yarn run build
    ```
3. **Запустить фронтенд**
    ```bash
    $ yarn run start
    ```
Фронтенд будет доступен по адресу: http://localhost:5173.
Чтобы изменить порт, отредактируйте frontend/webpack.config.js.

## ⚙ Установка и запуск бэкенда
1. **Установка PostgreSQL (для Ubuntu/Debian)**
```bash
$ sudo apt update
$ sudo apt install postgresql postgresql-contrib
```

2. **Запуск PostgreSQL**
```bash
$ sudo systemctl start postgresql
$ sudo systemctl status postgresql
```

3. **Создание пользователя и базы данных**
```bash
$ sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres';"

$ sudo -u postgres psql -c "CREATE DATABASE app OWNER postgres;"
```

4. **Установка зависимостей**
```bash
$ cd is-practice-2025/backend
$ pip install uv
$ uv sync
```

5. **Активация виртуального окружения (app)**
```bash
$ cd is-practice-2025/backend
$ source .venv/bin/activate
```

6. **Миграции Alembic**
```bash
(app) $ alembic revision --autogenerate -m "your message"
(app) $ alembic upgrade head
```
## Запуск сервера
```bash
(app) $ fastapi run --reload app/main.py
```
Бэкенд будет доступен по адресу: http://localhost:8000.