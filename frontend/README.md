## Ридмик без воды - как стартануть фронтенд
!!! Нужно у себя на ПК иметь [Node.js](https://nodejs.org/en/download/)
!!! и [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable) - вместо npm

### Все операции делаем в директории фронта
```
cd frontend
``
### Перед первым запуском - установка зависимостей
```
yarn install
```
(Ну и билд скрипт на всякий выполнить, доступные скрипты лежат в package.json)
```
yarn run build
```

### Запуск
```
yarn run start
```

Победа, по дефолту всё запускается на localhost:3000
<br>Изменить порт можно в webpack.config.js