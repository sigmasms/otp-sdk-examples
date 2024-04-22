import { BunJSRouteRegistry } from '@sigmasms/otp-sdk/controllers/bunjs.controller'
import { SigmaOtpSDKEnvironmentEnum } from '@sigmasms/otp-sdk/types/types';

/**
 * Запустите пример через BunJS https://bun.sh/
 */

const bunJSRouteRegistry = new BunJSRouteRegistry({
    environment: SigmaOtpSDKEnvironmentEnum.test,
    prefix: 'sigma-otp-form',
    routesCustomUrls: {
        getForm: 'getForm'
    }
});

const server = Bun.serve({
    port: 3400,
    async fetch(request) {
       const response = await bunJSRouteRegistry.handle(request);
       if (response) return response

       // other server logic
       return new Response("Welcome to Bun!");
    },
});


console.log(`Listening on localhost:${server.port}`);