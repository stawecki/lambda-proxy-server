import http = require("http");
import { URL } from "url";

// based on https://gist.github.com/Sleavely/f87448d2c1c13d467f3ea8fc7e864955 by https://github.com/Sleavely
export function createListener(options: any) {
    return (request: http.IncomingMessage, response: http.ServerResponse) => {
        const url = new URL(request.url!, `http://${request.headers.host}/`);

        let data = "";
        request.on("data", (chunk) => {
            data += chunk.toString(); // convert Buffer to string
        });
        request.on("end", () => {

            // The event object we're faking is a lightweight based on:
            // https://docs.aws.amazon.com/lambda/latest/dg/eventsources.html#eventsources-api-gateway-request
            const event = {
                body: data || (request as any).body, // i.e. middleware-injected
                headers: request.headers,
                httpMethod: request.method!.toUpperCase(),
                isBase64Encoded: false,
                path: url.pathname,
                pathParameters: {},
                queryStringParameters: Array.from(url.searchParams.keys()).reduce(
                    (output: {[key: string]: string | null}, key) => {
                        output[key] = url.searchParams.get(key); return output;
                    }, {}),
                requestContext: {},
                resource: "/{proxy+}",
                stageVariables: {},
            };

            try {
                const context = {
                    fail: (err: any) => {
                        response.writeHead(500);
                        response.end("" + err);
                    },
                    succeed: (res: any) => {
                        let {
                            body,
                        } = res;
                        const {
                            headers,
                            statusCode,
                        } = res;

                        if (res.isBase64Encoded) {
                            body = Buffer.from(body, "base64");
                        }

                        if (headers && !headers["content-length"] && body) {
                            headers["content-length"] = Buffer.from(body).length;
                        }

                        response.writeHead(statusCode, headers);
                        response.end(body);
                    },
                };
                const result = options.handler(event, context, (err: any, res: any) => {
                    if (err) {
                        context.fail(err);
                    } else {
                        context.succeed(res);
                    }
                });
                if (result && result.then) {
                    result.then( (resultData: any) => {
                        context.succeed(resultData);
                    });
                }
            } catch (err) {
                response.writeHead(500, { "content-length": 0 });
                response.end("" + err);
                throw err;
            }
        });
    };
}

export function createServer(options: any) {
    return http.createServer(createListener(options));
}
