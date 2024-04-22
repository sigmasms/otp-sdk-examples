import { SigmaOtpSDK } from '@sigmasms/otp-sdk'
import { AttemptsExpiredException, CaptchaNotConfirmedException, ChannelChangedException, FormIsBlockedException, FormNotFoundException, InvalidCodeException, NoAvailableChannelsException, NoConnectionException, RateLimitException, SessionTimeoutException } from '@sigmasms/otp-sdk/otp-handler.exception'
import { SigmaOtpSDKEnvironmentEnum } from '@sigmasms/otp-sdk/types/types'
import { consoleReadLine, waitKeyPress } from './common/cli'

const FORM_ID = '4dda52a6-f409-4ce3-a08c-000000000001'
const RECIPIENT = '+79991234567'

/***
* Пример иллюстрирует работу с формой, для которой может быть настроен любой из способов подтверждения:
 *  - Классический, в котором пользователь вводит код, отправленный ему в сообщении
 *  - Бескодовый, в котором пользователь должен совершить действие, например совершить звонок или отправить сообщение боту whatsapp
 * Взаимодействие с клиентом через консоль и симулирует поведение frontend
 * 
 * Пример без использования async/await, смотрите аналогичный в full.ts
 */
function handleError(e) {
    // Известные ошибки SDK, для которых потребуется перезапуск процесса авторизации
    if (e instanceof NoConnectionException
        || e instanceof NoAvailableChannelsException
        || e instanceof CaptchaNotConfirmedException
        || e instanceof AttemptsExpiredException
        || e instanceof SessionTimeoutException
        || e instanceof RateLimitException
    ) {
        console.log(`Ошибка: "${e.message}", попробуйте пройти авторизацию еще раз`)
        waitKeyPress().then(startOTPSession)

        // Известные ошибки SDK, которые подразумевают некорректную настройку формы
    } else if (e instanceof FormIsBlockedException
        || e instanceof FormNotFoundException
    ) {
        console.log(`Ошибка интеграции Sigma SDK: "${e.message}", обратитесь к разработчикам сервиса`)

        // Неизвестная ошибка, инициированная не SDK, например, внутри примера
    } else {
        console.error("Неизвестная ошибка")
        console.error("Детали для разработчиков:", e)
        console.error("Повторите процесс авторизации")
    }
}

function displayFromForChannel(client, requestId) {
    client.waitForChannelSelected(requestId).then(channel => {
        if (channel.channelType === 'code') {
            console.log(`Код авторизации отправлен вам через: "${channel.channelName}"`)
            const displayFromForEnterCode = () => {
                consoleReadLine(`Введите полученный код длинной ${channel.channelPayload.codeLength} символов: `)
                .then(code => client.verifyCode(requestId, code))
                .then(() => client.checkStatus(requestId))
                .then(status => {
                    if (status.success) {
                        console.log("Вы успешно прошли авторизацию!")
                        return client.complete(requestId)
                    }
                }).catch(e => {
                    if (e instanceof InvalidCodeException) {
                        console.log('Неверный код авторизации!')
                        return displayFromForEnterCode()
                    } else if (e instanceof ChannelChangedException) {
                        return displayFromForChannel(client, requestId)
                    } else {
                        throw e
                    }
                })
            }
            displayFromForEnterCode()
        } else {
            console.log(`Пройдите авторизацию через: "${channel.channelName}"`)
            console.log(`Следуйте инструкции: ${channel.channelPayload?.help}`)

            client.waitForSuccessStatus(requestId).catch(e => {
                if (e instanceof ChannelChangedException) {
                    return displayFromForChannel(client, requestId)
                } else {
                    throw e
                }
            }).then(() => {
                console.log("Вы успешно прошли авторизацию!")
                return client.complete(requestId)
            })
        }
    }).catch(handleError)
}

function startOTPSession() {
    // Инициализируем клиент
    const client = new SigmaOtpSDK({
        formId: FORM_ID,
        environment: SigmaOtpSDKEnvironmentEnum.test
    })

    // Загружаем данные формы и инициируем сессию OTP авторизации
    client.getFormData().then(formData => {
        console.log(`Загружена форма c названием "${formData.name}"`)
        return client.send(RECIPIENT)
    }).then(({ requestId }) => {
        console.log("Отправка запроса...")
        client.onError(requestId, (requestId, payload) => { 
            console.log("Ошибка из коллбека ошибок", requestId, payload)
        })

        // Принудительная смена формы авторизации по событию смены канала
        client.onChannelChanged(requestId, () => displayFromForChannel(client, requestId))

        // Отображение формы авторизации в зависимости от выбранного способа
        displayFromForChannel(client, requestId)
    }).catch(handleError)
}

startOTPSession()