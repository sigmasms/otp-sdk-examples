import { SigmaOtpSDK } from '@sigmasms/otp-sdk'
import {
    InvalidCodeException,
    ChannelChangedException
} from '@sigmasms/otp-sdk/otp-handler.exception'
import { SigmaOtpSDKEnvironmentEnum } from '@sigmasms/otp-sdk/types/types'
import { consoleReadLine } from './common/cli'

const FORM_ID = '4dda52a6-f409-4ce3-a08c-000000000001'
const RECIPIENT = '+79991234567'

async function startOTPSession() {
    try {
        const client = new SigmaOtpSDK({
            formId: FORM_ID,
            environment: SigmaOtpSDKEnvironmentEnum.test
        })

        const requestId = await waitForCodeRequest(client)
        await processCodeInput(client, requestId)
    } catch (e) {
        console.log(`Ошибка: ${e?.message}. Попробуйте начать сессию заново.`)
    }
}

async function waitForCodeRequest(client) {
    console.log("Отправка запроса...")
    const { requestId } = await client.send(RECIPIENT)
    const channel = await client.waitForChannelSelected(requestId)

    if (channel.channelType !== 'code') {
        throw new Error("Тип канала не поддерживается. Ожидается 'code'.")
    }

    console.log(`Код авторизации отправлен через: "${channel.channelName}"`)
    return requestId
}

async function processCodeInput(client, requestId) {
    try {
        const code = await consoleReadLine(`Введите полученный код: `)
        await client.verifyCode(requestId, code)

        console.log("Вы успешно прошли авторизацию!")
    } catch (e) {
        if (e instanceof InvalidCodeException || e instanceof ChannelChangedException) {
            console.log('Попробуйте еще раз.')
            await processCodeInput(client, requestId)
        } else {
            throw e
        }
    }
}

startOTPSession()