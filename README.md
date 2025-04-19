# Название проекта TBD

Тут описание проекта: TBD.

---

## 🚀 Быстрый старт

### Требования
- Node.js (версия X.X или выше)
- npm (версия X.X или выше)
- Python (версия X.X или выше)
- PostgreSQL

---

## 🛠 Технологический стек

### Бэкенд
- ⚡ [FastAPI](https://fastapi.tiangolo.com) - высокопроизводительный фреймворк для создания API
- 🧰 [SQLModel](https://sqlmodel.tiangolo.com) - современный ORM с поддержкой Pydantic и SQLAlchemy
- 🔍 [Pydantic](https://docs.pydantic.dev) - валидация данных и управление настройками
- 💾 PostgreSQL - реляционная база данных
- 🐘 [Alembic](https://alembic.sqlalchemy.org) - система миграций базы данных
- 🔒 JWT-аутентификация
- 🧪 [Pytest](https://pytest.org) - тестирование кода

### Фронтенд
- ⚛️ [React](https://react.dev) - библиотека для построения пользовательских интерфейсов
- 💅 [TypeScript](https://www.typescriptlang.org) - статическая типизация
- 🚀 [Vite](https://vitejs.dev) - сборка и горячая перезагрузка
- 🎨 [Chakra UI](https://chakra-ui.com) - компонентная библиотека
- 📦 Webpack - бандлинг ассетов
---

## 🖥 Установка и запуск


1. **Клонировать репозиторий**  
   ```bash
   git clone https://github.com/10xtheo/is-practice-2025
    ```
    ```bash
    cd /is-practice-2025
    ```
## ⚙ Установка и запуск фронтенда 
1. **Установить зависимости**
    ```bash
    cd /frontend
    npm install
    ```
2. **(Опционально) Собрать проект**
    ```bash
    npm run build
    ```
3. **Запустить фронтенд**
    ```bash
    npm run start
    ```
Фронтенд будет доступен по адресу: http://localhost:3000.
Чтобы изменить порт, отредактируйте webpack.config.js.

## ⚙ Установка и запуск бэкенда
1. **Установка PostgreSQL (для Ubuntu/Debian)**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```
2. **Создать пользователя и базу данных**
```bash
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres';"

sudo -u postgres psql -c "CREATE DATABASE app OWNER postgres;"
```
## Установка зависимостей
```bash
cd is-practice-2025/backend
pip install uv
uv sync
```
## Миграции Alembic
```bash
alembic revision --autogenerate -m "your message"
alembic upgrade head
```
## Запуск сервера
```bash
fastapi run --reload app/main.py
```
Бэкенд будет доступен по адресу: http://localhost:8000.