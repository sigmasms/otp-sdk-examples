import { Module } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { NestJsOtpModule } from "@sigmasms/otp-sdk/controllers/nestjs-otp-module/nestjs-otp.module"
import { SigmaOtpSDKEnvironmentEnum } from "@sigmasms/otp-sdk/types/types"

/**
 * Пример NestJS-приложения, в которое добавлен готовый контроллер из SDK
 */
@Module({
    imports: [
        NestJsOtpModule.register({
            environment: SigmaOtpSDKEnvironmentEnum.test
        })
    ],
    controllers: [],
    providers: []
})
class AppModule { }

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    const port = 3400
    const host = '0.0.0.0'

    await app.listen(port, host)
}

bootstrap()
