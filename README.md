# SIGMA OTP NodeJS SDK

<p align="center">
  <img src="https://sigmasms.ru/wp-content/uploads/2023/01/logo.svg">
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/sigma-otp-sdk"><img src="https://img.shields.io/npm/v/sigma-otp-sdk.svg" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/sigma-otp-sdk"><img src="https://img.shields.io/npm/dt/sigma-otp-sdk.svg" alt="downloads total" /></a>
  <a href="https://www.npmjs.com/package/sigma-otp-sdk"><img src="https://img.shields.io/npm/dw/sigma-otp-sdk.svg" alt="downloads week" /></a>
</p>

## Введение
SDK предоставляет удобный интерфейс к сервису авторизации SIGMA по различным каналам: SMS, Flashcall, голосовая авторизация, Viber, WhatsApp, авторизация по мобильному ID, Callback. [Подробнее о сервисе](https://sigmasms.ru/servis-avtorizatsij/). \
SIGMA OTP SDK для NodeJS помогает быстро интегрировать функционал в ваше приложение, предлагая гибкие настройки для уникальных требований проекта.

## Быстрая интеграция
Импортируйте SDK и используйте предоставленные контроллеры для nestjs, express, fastify, или Bun.js.

### Пример с Express:

```javascript
import express from 'express';
import { registerExpressRoutes } from '@sigma-otp-sdk/controllers/express.controller';

const app = express();
app.use(express.json());

registerExpressRoutes(app, 'your_form_id');

app.listen(3000, () => {
    console.log(`Server running on port 3000`);
});

```
Все примеры смотрите в папке [examples](./src/examples/README.md).

## Принцип работы
1. **Загрузка данных формы**: Frontend запрашивает данные у Backend, который обращается к SDK.
2. **Инициация сессии авторизации**: Пользователь вводит номер телефона, и система инициирует процесс авторизации.
3. **Отображение формы авторизации**: Предоставляется способ авторизации, который отображается пользователю.
4. **Проверка статуса и завершение**: Пользователь завершает авторизацию, а система проверяет статус.\
[Подробная схема возаимодействия вашего frontend и backend с SDK](./schema.md).

## Установка и настройка
Убедитесь, что у вас установлен Node.js версии 12 и выше, и выполните следующую команду для установки SDK:
```bash
npm install sigma-otp-sdk
```

## Использование SDK

### Инициализация и отправка кода
```typescript
import { SigmaOtpSDK } from '@sigma-otp-sdk';

const client = new SigmaOtpSDK({ formId: 'your_form_id' });
const { requestId } = await client.send('phone_number');
```

### Получение и подтверждение кода
```typescript
const channel = await client.getChannel(requestId);
if (channel.channelType === 'code') {
    await client.verifyCode(requestId, '1234');
}
```

### Проверка статуса и завершение сессии
```typescript
const status = await client.checkStatus(requestId);
if (status.success) {
    await client.complete(requestId);
}
```

### Обработка ошибок
Информацию по обработке ошибки их полный список смотрите в [руководстве по обработке ошибок](./error-handling.md).

### События
SDK предоставляет возможность подписаться на определенные события в процессе авторизации. Подробнее в [инструкции по работе с событиями](./events.md).

## Дополнительные ресурсы
- [Поддержка](mailto:user@example.com)


### Часто задаваемые вопросы (FAQ)

**Вопрос: Какие функции поддерживает SIGMA OTP SDK?**
*Ответ: SDK предоставляет интерфейс к сервису авторизации SIGMA через различные каналы, включая SMS, Flashcall, голосовую авторизацию, Viber, WhatsApp, авторизацию по мобильному ID, и Callback.*

**Вопрос: Как начать использовать SIGMA OTP SDK в моем NodeJS проекте?**
*Ответ: Установите SDK с помощью npm командой `npm install @sigmasms/otp-sdk`, затем импортируйте нужные контроллеры (например, для Express, NestJS или Fastify) и зарегистрируйте маршруты в вашем приложении.*

**Вопрос: Есть ли примеры использования SDK?**
*Ответ: Да, в папке [Примеры](./src) вы найдете дополнительные примеры интеграции SDK в ваше приложение с использованием различных фреймворков.*

**Вопрос: Каковы требования к версии Node.js для использования SDK?**
*Ответ: Для использования SIGMA OTP SDK необходим Node.js версии 12 или выше.*

**Вопрос: Как инициировать сессию авторизации с использованием SDK?**
*Ответ: Инициализация сессии начинается с создания экземпляра SigmaOtpSDK и вызова метода send с номером телефона пользователя. Это приведет к получению requestId, который используется для последующих операций.*

**Вопрос: Как подтвердить код авторизации, полученный пользователем?**
*Ответ: После получения кода, используйте метод `verifyCode` с requestId и самим кодом для подтверждения. Успешное подтверждение переводит сессию в следующий статус.*

**Вопрос: Как проверить статус сессии авторизации?**
*Ответ: Вызовите метод `checkStatus` с requestId для получения текущего статуса сессии. Этот статус поможет определить, завершена ли сессия или требуются дополнительные действия.*

**Вопрос: Где найти информацию об обработке ошибок?**
*Ответ: Информацию и примеры по обработке различных типов ошибок вы найдете в [Руководстве по обработке ошибок](./src/error_handling.md).*

**Вопрос: Какие дополнительные ресурсы доступны для работы с SDK?**
*Ответ: Вы можете обратиться к документации по регистрации контроллеров для Frontend, подписке на события, полному списку примеров использования SDK, а также к схеме взаимодействия и поддержке в соответствующих разделах документации.*

Этот FAQ предоставляет общую информацию и руководство для новых пользователей SIGMA OTP SDK, помогая быстро решить наиболее распространенные вопросы и проблемы.