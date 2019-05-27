# lambda-proxy-server

Standalone, minimalistic server and listener for simulating API Gateway Lambda Proxy integration.

_For Node.js Lambdas only._

**Note:** For local development only. Many API Gateway features are missing.

**Features:**

* Compatible with: [aws-serverless-express](https://github.com/awslabs/aws-serverless-express) and [lambda-api](https://github.com/jeremydaly/lambda-api)
* Standalone - run without SAM CLI or Serverless Framework
* Listener support - bring your own server or attach to router.
* POST body data support

## Usage

Install:
```
npm install lambda-proxy-server
```

There are multiple ways in which you can use this module:

* Create a server script:
```javascript
const server = require("lambda-proxy-server").createServer({
    handler: require("./path/to/lambda")["methodName"]
});
server.listen(8080, function () {
    console.log("Listening on http://localhost:" + server.address().port + "/");
});
```

* Or, use the "run" script:
```bash
export LAMBDA_PATH="`pwd`/mylambda/handler"; \
export LAMBDA_FUNC="run"; \
export PROXY_PORT="8907"; \
node ./node_modules/lambda-proxy-server/run
```

## Credits

Based on this [gist](https://gist.github.com/Sleavely/f87448d2c1c13d467f3ea8fc7e864955) by [Sleavely](https://github.com/Sleavely).