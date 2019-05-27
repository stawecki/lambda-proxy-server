import { URL } from "url";
import http = require("http");

// based on https://gist.github.com/Sleavely/f87448d2c1c13d467f3ea8fc7e864955 by https://github.com/Sleavely
export function createListener(options:any) {
    return function (request: http.IncomingMessage, response: http.ServerResponse) {
        const url = new URL(request.url!, `http://${request.headers.host}/`)

        let body = '';
        request.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        request.on('end', () => {

            // The event object we're faking is a lightweight based on:
            // https://docs.aws.amazon.com/lambda/latest/dg/eventsources.html#eventsources-api-gateway-request
            const event = {
                httpMethod: request.method!.toUpperCase(),
                path: url.pathname,
                resource: '/{proxy+}',
                queryStringParameters: Array.from(url.searchParams.keys()).reduce(
                    (output:{[key:string]:string | null}, key) => {
                        output[key] = url.searchParams.get(key); return output
                    }, {}),
                headers: request.headers,
                requestContext: {},
                pathParameters: {},
                stageVariables: {},
                isBase64Encoded: false,
                body: body || (request as any).body, // i.e. middleware-injected
            }

            try {
                const context = {
                    succeed: (res: any) => {
                        let {
                            body,
                            headers,
                            statusCode,
                        } = res

                        if (res.isBase64Encoded) {
                            body = Buffer.from(body, 'base64');
                        }

                        if (headers && !headers['content-length'] && body) {
                            headers['content-length'] = body.length;
                        }

                        response.writeHead(statusCode, headers);
                        response.end(body);
                    }
                };
                const result = options.handler(event, context)
                if (result && result.then) {
                    result.then( (resultData: any) => {
                        context.succeed(resultData);
                    });
                }
            } catch (err) {
                response.writeHead(500, { 'content-length': 0 });
                response.end(''+err);
                throw err
            }
        });

    }
}

export function createServer(options:any) {
    return http.createServer(createListener(options));
}
