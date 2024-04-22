# SIGMA OTP NodeJS SDK
 
## Примеры использования готовых контроллеров
SDK предоставляет готовые контроллеры с возможностью гибкой настройки. Вам достаточно вызвать метод инициализации контроллера и SDK добавит в ваше backend приложение все необходимые роуты. Вы можете настраивать префикс для ендпоинтов и менять название каждого при необходимости. Полный тип настроек:

```ts
export type SigmaOtpSDKSettings = {
    environment: SigmaOtpSDKEnvironmentEnum;
    prefix?: string;
    routesCustomUrls?: {
        getForm?: string;
        send?: string;
        getChannel?: string;
        getStatus?: string;
        verifyCode?: string;
        checkStatusAndComplete?: string;
        complete?: string;
    };
};
```

| Пример  | Команда для запуска |
| ------------- | ------------- |
| [Пример быстрой интеграции express контроллера](./use-express-controller.ts)  | `npm run examples:use-express-controller`  | 
| [Пример быстрой интеграции fastify контроллера](./use-fastify-controller.ts)  | `npm run examples:use-fastify-controller`  | 
| [Пример быстрой интеграции bunjs контроллера](./use-bunjs-controller.ts)  | `bun run examples:use-bunjs-controller`  | 

## Примеры работы с SDK
Здесь представлены полные примеры использования методов SDK на TS и JS, в случае если вам необходимо использовать его только на бэкенде (частично или полностью), либо вы используете другой транспорт для общения с frontend (graphql, sockets итд)

| Пример  | Команда для запуска |
| ------------- | ------------- |
| [Полный пример процесса авторизации в виде cli-приложения TypeScript](./full.ts)  | `npm run examples:examples:full`  |
| [Полный пример процесса авторизации в виде cli-приложения JavaScript](./full.js)  | `npm run examples:full:js`  | 
| [Полный пример TypeScript без использования async/await](./full-callbacks.ts)  | `npm run examples:full-callbacks`  |
| [Полный пример JavaScript без использования async/await](./full-callbacks.js)  | `npm run examples:full-callbacks-js`  | 
| [Пример работы только с кодовыми каналами](./simple-code.ts)  | `npm run examples:simple-code`  | 
| [Пример работы только с бесиодовыми каналами](./simple-codeless.ts)  | `npm run examples:simple-codeless`  | 
| [Пример полного процесса на основе подписки на события](./events.ts)  | `npm run examples:events`  | 
