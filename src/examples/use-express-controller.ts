import * as express from 'express';
import { registerExpressRoutes } from '@sigmasms/otp-sdk/controllers/express.controller';
import { SigmaOtpSDKEnvironmentEnum } from '@sigmasms/otp-sdk/types/types';

/**
 * Пример express-приложения, в которое добавлен готовый контроллер из SDK
 */

const app = express();
const port = 3400;

// Middleware для разбора JSON-тел запросов
app.use(express.json()); 

// Регистрация маршрутов через контроллер
registerExpressRoutes(app, {
    environment: SigmaOtpSDKEnvironmentEnum.test,
    prefix: 'sigma-otp-form',
    routesCustomUrls: {
        getForm: 'getForm'
    }
});

console.log("Express registered endpoints", app._router.stack.filter(route => route.route).map(route => route.route.path))
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});