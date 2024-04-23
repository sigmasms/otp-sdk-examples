import { SigmaOtpSDK } from '@sigmasms/otp-sdk'
import { ChannelChangedException, InvalidCodeException } from '@sigmasms/otp-sdk/otp-handler.exception'
import { SigmaOtpSDKEnvironmentEnum } from '@sigmasms/otp-sdk/types/types'
import { consoleReadLine, waitKeyPress } from './common/cli'

/**
 * Пример полного процесса на основе подписки на события.
 * Дополнительная документация по работе с событиями тут https://github.com/sigmasms/otp-sdk-examples/blob/main/events.md
 */

const FORM_ID = '4dda52a6-f409-4ce3-a08c-000000000001'
const RECIPIENT = '+79991234567'

const client = new SigmaOtpSDK({
    formId: FORM_ID,
    environment: SigmaOtpSDKEnvironmentEnum.test
})

let channel

async function startOTPSession() {
    try {
       
        const { requestId } = await client.send(RECIPIENT)
        console.log("Отправка запроса...")

        // Подписка на события
        subscribeToEvents(client, requestId)

        displayFormForChannel(client, requestId)
    } catch (e) {
        handleUnknownError(e)
    }
}

function subscribeToEvents(client, requestId) {
    client.onChannelChanged(requestId, async (payload) => {
        console.log(`Канал изменен: ${requestId}`, payload)
        await displayFormForChannel(client, requestId)
    })

    client.onSuccessConfirmation(requestId, (payload) => {
        console.log(`Успешное подтверждение: ${requestId}`, payload)
        console.log("Вы успешно прошли авторизацию!")
        client.complete(requestId)
    })

    client.onError(requestId, handleError)
}

async function displayFormForChannel(client, requestId) {
    channel = await client.waitForChannelSelected(requestId)
    // Логика отображения формы в зависимости от типа канала
    // Пример для кодового канала:
    if (channel.channelType === 'code') {
        console.log(`Код авторизации отправлен через: "${channel.channelName}"`)
        await displayFormForEnterCode(client, requestId, channel)
    } else {
        console.log(`Пройдите авторизацию через: "${channel.channelName}"`)
        console.log(`Следуйте инструкции: ${channel.channelPayload?.help}`)
    }
}

async function displayFormForEnterCode(client, requestId, channel) {
    const code = await consoleReadLine(`Введите полученный код длинной ${channel.channelPayload.codeLength} символов: `)
    client.verifyCode(requestId, code)
}

function handleError(e, requestId) {
    if (e instanceof InvalidCodeException) {
        console.log('Неверный код авторизации!')
        displayFormForEnterCode(client, requestId, channel)
    } else if (e instanceof ChannelChangedException) {
        console.log('Канал был изменен!')
        displayFormForChannel(client, requestId)
    } else {
        // Обработка известных ошибок
        console.log(`Ошибка: "${e.message}", попробуйте пройти авторизацию еще раз`)
        waitKeyPress().then(() => startOTPSession())
    }
}

function handleUnknownError(e) {
    console.error("Неизвестная ошибка", e)
    console.error("Повторите процесс авторизации")
}

startOTPSession()