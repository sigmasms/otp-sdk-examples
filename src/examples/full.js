const { SigmaOtpSDK } = require('@sigmasms/otp-sdk');
const { AttemptsExpiredException, CaptchaNotConfirmedException, ChannelChangedException, FormIsBlockedException, FormNotFoundException, InvalidCodeException, NoAvailableChannelsException, NoConnectionException, RateLimitException, SessionTimeoutException } = require('@sigmasms/otp-sdk/otp-handler.exception');
const { SigmaOtpSDKEnvironmentEnum } = require('@sigmasms/otp-sdk/types/types');
const { consoleReadLine, waitKeyPress } = require('./common/cli');

/**
 * Пример иллюстрирует работу с формой, для которой может быть настроен любой из способов подтверждения:
 *  - Классический, в котором пользователь вводит код, отправленный ему в сообщении
 *  - Бескодовый, в котором пользователь должен совершить действие, например совершить звонок или отправить сообщение боту whatsapp
 * Взаимодействие с клиентом через консоль и симулирует поведение frontend
 * Пример c использованием async/await, смотрите аналогичный в full-callbacks.js
 */

const FORM_ID = '4dda52a6-f409-4ce3-a08c-000000000001';
const RECIPIENT = '+79991234567';

async function startOTPSession() {
    try {
        const client = new SigmaOtpSDK({
            formId: FORM_ID,
            environment: SigmaOtpSDKEnvironmentEnum.test
        });

        const formData = await client.getFormData();
        console.log(`Загружена форма c названием "${formData.name}"`);

        const { requestId } = await client.send(RECIPIENT);
        console.log("Отправка запроса...");

        client.onError(requestId, (requestId, payload) => {
            console.log("Ошибка из коллбека ошибок", requestId, payload);
        });

        const displayFromForChannel = async () => {
            const channel = await client.waitForChannelSelected(requestId);

            if (channel.channelType === 'code') {
                console.log(`Код авторизации отправлен вам через: "${channel.channelName}"`);

                const displayFromForEnterCode = async () => {
                    try {
                        const code = await consoleReadLine(`Введите полученный код длинной ${channel.channelPayload.codeLength} символов: `);
                        await client.verifyCode(requestId, code);

                        const status = await client.checkStatus(requestId);
                        if (status.success) {
                            console.log("Вы успешно прошли авторизацию!");
                            await client.complete(requestId);
                        }

                    } catch (e) {
                        if (e instanceof InvalidCodeException) {
                            console.log('Неверный код авторизации!');
                            await displayFromForEnterCode();
                        } else if (e instanceof ChannelChangedException) {
                            await displayFromForChannel();
                        } else {
                            throw e;
                        }
                    }
                };
                await displayFromForEnterCode();
            } else {
                console.log(`Пройдите авторизацию через: "${channel.channelName}"`);
                console.log(`Следуйте инструкции: ${channel.channelPayload?.help}`);

                try {
                    await client.waitForSuccessStatus(requestId);
                } catch (e) {
                    if (e instanceof ChannelChangedException) {
                        await displayFromForChannel();
                    } else {
                        throw e;
                    }
                }

                console.log("Вы успешно прошли авторизацию!");
                await client.complete(requestId);
            }
        };

        client.onChannelChanged(requestId, displayFromForChannel);
        await displayFromForChannel();
    } catch (e) {
        if (e instanceof NoConnectionException
            || e instanceof NoAvailableChannelsException
            || e instanceof CaptchaNotConfirmedException
            || e instanceof AttemptsExpiredException
            || e instanceof SessionTimeoutException
            || e instanceof RateLimitException
        ) {
            console.log(`Ошибка: "${e.message}", попробуйте пройти авторизацию еще раз`);
            await waitKeyPress();
            startOTPSession();
        } else if (e instanceof FormIsBlockedException
            || e instanceof FormNotFoundException
        ) {
            console.log(`Ошибка интеграции Sigma SDK: "${e.message}", обратитесь к разработчикам сервиса`);
        } else {
            console.error("Неизвестная ошибка");
            console.error("Детали для разработчиков:", e);
            console.error("Повторите процесс авторизации");
        }
    }
}

startOTPSession();