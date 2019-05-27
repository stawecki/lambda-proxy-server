"use strict";
const server = require("lambda-proxy-server").createServer({
    handler: require(process.env.LAMBDA_PATH)[process.env.LAMBDA_FUNC]
});
server.listen(process.env.PROXY_PORT, function () {
    console.log("Listening on http://localhost:" + server.address().port + "/");
});
/* 
export LAMBDA_PATH="`pwd`/mylambda/handler"; \
export LAMBDA_FUNC="run"; \
export PROXY_PORT="8907"; \
node ./node_modules/lambda-proxy-server/run 
*/
