### Инструкция по работе с событиями в SigmaOtpSDK

В этой инструкции вы найдёте описание использования библиотеки SigmaOtpSDK для обработки событий одноразовых паролей (OTP). В примере кода описан процесс начала сессии OTP, подписка на различные события и их обработка.

#### Подключение и инициализация

Перед началом работы необходимо импортировать необходимые модули и создать экземпляр `SigmaOtpSDK`.

```javascript
import { SigmaOtpSDK } from '@sigmasms/otp-sdk';
import { SigmaOtpSDKEnvironmentEnum } from '@sigmasms/otp-sdk/types/types';

const client = new SigmaOtpSDK({
    formId: '4dda52a6-f409-4ce3-a08c-000000000001', // Идентификатор формы
    environment: SigmaOtpSDKEnvironmentEnum.test    // Окружение (тестовое)
});
```

#### Подписка на события

Для отслеживания изменений и реакции на события в рамках сессии OTP используется встроенные методы экземпляра класса клиента `client.onChannelChanged`, `client.onSuccessConfirmation` и `client.onError`.

```javascript
 
    client.onChannelChanged(requestId, async (payload) => {
        console.log(`Канал изменен: ${requestId}`, payload);
        await displayFormForChannel(client, requestId);
    });

    client.onSuccessConfirmation(requestId, (payload) => {
        console.log(`Успешное подтверждение: ${requestId}`, payload);
        console.log("Вы успешно прошли авторизацию!");
        client.complete(requestId);
    });

    client.onError(requestId, (e, requestId) => {
        if (e instanceof InvalidCodeException) {
            console.log('Попробуйте ввести код еще раз.') 
        } else {
            // other logic
        }
    });
 
```

#### Список и описание возможных событий

1. **onChannelChanged** - Событие изменения канала. Срабатывает, когда система выбирает другой способ получения OTP. Полезно для адаптации интерфейса под новый способ авторизации / ввода кода.

2. **onSuccessConfirmation** - Событие успешного подтверждения кода. Используется для информирования пользователя об успешной авторизации и завершения сессии OTP.

3. **onError** - Событие возникновения любой из ошибок. Полный список ошибок смотрите в [руководстве по обработке ошибок](./error-handling.md). Позволяет обрабатывать различные исключения, информировать пользователя о необходимости повторить попытку, запускать смену канала либо выполнять любую произвольную логику.

#### Пример использования

Пример запуска сессии OTP, включая обработку событий и динамическое взаимодействие с пользователем.

```javascript
async function startOTPSession() {
    try {
        const { requestId } = await client.send('+79991234567');  // Отправка OTP
        console.log("Отправка запроса...");
        client.onError(requestId, (e, requestId) => {
            if (e instanceof InvalidCodeException) {
                console.log('Попробуйте ввести код еще раз.') 
            } else {
                // other logic
            }
        });
    } catch (e) {
        handleUnknownError(e);
    }
}

startOTPSession();
```
[Пример полного процесса на основе подписки на события](./src/examples/events.ts), для запуска используйте команду `npm run examples:events`


В данном примере реализован полный жизненный цикл использования OTP: отправка запроса, подписка на события, обработка изменений и завершение сессии при успешной аутентификации. Это обеспечивает гибкость и надёжность при работе с OTP.

