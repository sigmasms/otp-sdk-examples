import * as express from 'express';
import { registerExpressRoutes } from '@sigmasms/otp-sdk/controllers/express.controller';
import { SigmaOtpSDKEnvironmentEnum } from '@sigmasms/otp-sdk/types/types';

const app = express();
const port = 3400;

app.use(express.json()); // Для разбора JSON-тел запросов

// Регистрация маршрутов через контроллер
registerExpressRoutes(app, {
    environment: SigmaOtpSDKEnvironmentEnum.test,
    prefix: 'sigma-otp-form',
    routesCustomUrls: {
        getForm: 'getForm'
    }
});

console.log("app._router.stack", app._router.stack)
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});