import { SigmaOtpSDK } from '@sigmasms/otp-sdk'
import { AttemptsExpiredException, CaptchaNotConfirmedException, ChannelChangedException, FormIsBlockedException, FormNotFoundException, InvalidCodeException, LongPollingTimeoutException, NoAvailableChannelsException, NoConnectionException, RateLimitException, SessionTimeoutException } from '@sigmasms/otp-sdk/otp-handler.exception'
import { SigmaOtpSDKEnvironmentEnum } from '@sigmasms/otp-sdk/types/types'
import { consoleReadLine, waitKeyPress } from './common/cli'

/**
 * Пример иллюстрирует работу с формой, для которой может быть настроен любой из способов подтверждения:
 *  - Классический, в котором пользователь вводит код, отправленный ему в сообщении
 *  - Бескодовый, в котором пользователь должен совершить действие, например совершить звонок или отправить сообщение боту whatsapp
 * Взаимодействие с клиентом через консоль и симулирует поведение frontend
 * Пример c использованием async/await, смотрите аналогичный в full-callbacks.ts
 */

const FORM_ID = '4dda52a6-f409-4ce3-a08c-000000000001'
const RECIPIENT = '+79991234563'

async function startOTPSession() {
    try {
        // Инициализируем клиент
        const client = new SigmaOtpSDK({
            formId: FORM_ID,
            environment: SigmaOtpSDKEnvironmentEnum.test
        })

        // Загружаем данные формы
        const formData = await client.getFormData()
        console.log(`Загружена форма c названием "${formData.name}"`)

        // Инициируем сессию OTP авторизации
        const { requestId } = await client.send(RECIPIENT)
        console.log("Отправка запроса...")

        // Регистрируем обработчик ошибок для запроса
        client.onError(requestId, (requestId: string, payload) => {
            console.log("Ошибка из коллбека ошибок", requestId, payload)
        })

        // Загрузка и отображение формы авторизации в зависимости от выбранного системой способа авторизации.
        const displayFromForChannel = async () => {
            const channel = await client.waitForChannelSelected(requestId)
            console.log('channel', channel)
            if (channel.channelCodeType === 'code') {
                console.log(`Код авторизации отправлен вам через: "${channel.channelLabel}"`, channel)

                const displayFromForEnterCode = async () => {
                    try {
                        const code = await consoleReadLine(`Введите полученный код длинной ${channel.channelPayload.codeLength} символов: `)
                        await client.verifyCode(requestId, code)

                        const status = await client.checkStatus(requestId)
                        if (status.success) {
                            console.log("Вы успешно прошли авторизацию!")
                            await client.complete(requestId)
                        }

                    } catch (e) {
                        if (e instanceof InvalidCodeException) {
                            console.log('Неверый код авторизации!')
                            // Повторяем попытку ввода кода
                            await displayFromForEnterCode()
                        } else if (e instanceof ChannelChangedException) {
                            // 
                            await displayFromForChannel()
                        } else {
                            // Обрабатываем общей логикой
                            throw e
                        }
                    }
                }
                await displayFromForEnterCode()
            } else {
                console.log(`Пройдите авторизацию через: "${channel.channelLabel}"`)
                console.log(`Следуйте инструкции: ${channel.channelPayload?.help}`)

                try {
                    await client.waitForSuccessStatus(requestId)
                } catch (e) {
                    if (e instanceof ChannelChangedException) {
                        await displayFromForChannel()
                    } else {
                        // Обрабатываем общей логикой
                        throw e
                    }
                }

                console.log("Вы успешно прошли авторизацию!")
                await client.complete(requestId)
            }
        }

        // Принудительная смена формы авторизиции по событию смена канала
        client.onChannelChanged(requestId, displayFromForChannel)
        await displayFromForChannel()
    } catch (e: unknown) {
        // Известные ошибки SDK, для которых потребуется перезапуск процесса авторизации
        if (e instanceof NoConnectionException
            || e instanceof NoAvailableChannelsException
            || e instanceof CaptchaNotConfirmedException
            || e instanceof AttemptsExpiredException
            || e instanceof SessionTimeoutException
            || e instanceof RateLimitException
        ) {
            console.log(`Ошибка: "${e.message}", попробуйте пройти авторизацию еще раз`)
            await waitKeyPress()
            startOTPSession()

            // Известные ошибки SDK, которые подразумивают некорректную настройку формы
        } else if (e instanceof FormIsBlockedException
            || e instanceof FormNotFoundException
        ) {
            console.log(`Ошибка интеграции Sigma SDK: "${e.message}", обратитесь к разработчикам сервиса`)

            // Неизвестная ошибка, инициированная не SDK, например, внутри примера
        } else {
            console.error("Неизвестая ошибка")
            console.error("Детали для разработчиков:", e)
            console.error("Повторите процесс авторизации")
        }
    }
}

startOTPSession()
