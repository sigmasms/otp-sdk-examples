import fastify from 'fastify'; 
const _importDynamic = new Function("modulePath", "return import(modulePath)")

import { registerFastifyRoutes } from '@sigmasms/otp-sdk/controllers/fastify.controller';
import { SigmaOtpSDKEnvironmentEnum } from '@sigmasms/otp-sdk/types/types';

const start = async () => {
    try {
        const app = fastify();
        const fastifyPrintRoutes = await _importDynamic('fastify-print-routes')
        await app.register(fastifyPrintRoutes as any)
        registerFastifyRoutes(app, {
            environment: SigmaOtpSDKEnvironmentEnum.test,
            prefix: 'sigma-otp-form',
            routesCustomUrls: {
                getForm: 'getForm'
            }
        });

        console.log('Server running on port 3400');
        await app.listen({ port: 3400 });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();