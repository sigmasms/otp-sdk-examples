import { SigmaOtpSDK } from '@sigmasms/otp-sdk'
import { ChannelChangedException } from '@sigmasms/otp-sdk/otp-handler.exception'
import { SigmaOtpSDKEnvironmentEnum } from '@sigmasms/otp-sdk/types/types'

/**
 * Простой пример для использования только каналов с бескодовым подтверждением
 */

const FORM_ID = '4dda52a6-f409-4ce3-a08c-000000000001'
const RECIPIENT = '+79991234567'

async function startOTPSession() {
    try {
        const client = new SigmaOtpSDK({
            formId: FORM_ID,
            environment: SigmaOtpSDKEnvironmentEnum.test
        })

        const requestId = await waitForNonCodeRequest(client)
        await processNonCodeAuthorization(client, requestId)
    } catch (e) {
        console.log(`Ошибка: ${e?.message}. Попробуйте начать сессию заново.`)
    }
}

async function waitForNonCodeRequest(client) {
    console.log("Отправка запроса...")
    const { requestId } = await client.send(RECIPIENT)
    const channel = await client.waitForChannelSelected(requestId)

    if (channel.channelType === 'code') {
        throw new Error("Этот пример не поддерживает каналы с кодом.")
    }

    console.log(`Пройдите авторизацию через: "${channel.channelName}". Следуйте инструкции: ${channel.channelPayload?.help || "проверьте ваше устройство или приложение"}.`)
    return requestId
}

async function processNonCodeAuthorization(client, requestId) {
    try {
        // Ожидание успешного статуса авторизации
        await client.waitForSuccessStatus(requestId)
        console.log("Вы успешно прошли авторизацию!")
    } catch (e) {
        if (e instanceof ChannelChangedException) {
            console.log('Канал авторизации был изменен, обновляем информацию...')
            await waitForNonCodeRequest(client)
        } else {
            throw e
        }
    }
}
 
startOTPSession()