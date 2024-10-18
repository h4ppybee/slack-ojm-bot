import dotenv from 'dotenv';
import { OJMDefine } from './src/slack-bot/slack.define.mjs';
import { action, queueAction } from './src/slack-bot/bind-action.mjs';
import querystring from 'querystring';
// 환경 변수를 로드합니다.
dotenv.config();
export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        if (event.type) {
            return await action(event);
        } else if (event.Records) {
            for (const record of event.Records) {
                return await queueAction(record);
            }
        }
        else {
            const decodedString = Buffer.from(event.body, 'base64').toString('utf-8');
            const parsedBody = querystring.parse(decodedString);
            console.log('Parsed body:', parsedBody);

            const res = await action(parsedBody);
            console.log('Response:', res);
            return res;
        }
    } catch (error) {
        console.error('Error in handler:', error);

        const response = {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to send message', error: error.message }),
        };
        return response;
    }
};

// await handler({
//     "version": "2.0",
//     "routeKey": "$default",
//     "rawPath": "/",
//     "rawQueryString": "",
//     "headers": {
//         "content-length": "459",
//         "x-amzn-tls-version": "TLSv1.3",
//         "x-forwarded-proto": "https",
//         "x-forwarded-port": "443",
//         "x-forwarded-for": "44.197.108.94",
//         "accept": "application/json,*/*",
//         "x-amzn-tls-cipher-suite": "TLS_AES_128_GCM_SHA256",
//         "x-amzn-trace-id": "Root=1-6710de11-3de5c7e07571ed0c2a6b7954",
//         "host": "kzo6ksoiakaqwztrvo7ukuw24u0wmfyh.lambda-url.us-east-2.on.aws",
//         "content-type": "application/x-www-form-urlencoded",
//         "x-slack-request-timestamp": "1729158673",
//         "x-slack-signature": "v0=b3c33507e2ce9345b0a43e42adcada9b7c8a92c2c33c793dd06967d9e3559f27",
//         "accept-encoding": "gzip,deflate",
//         "user-agent": "Slackbot 1.0 (+https://api.slack.com/robots)"
//     },
//     "requestContext": {
//         "accountId": "anonymous",
//         "apiId": "kzo6ksoiakaqwztrvo7ukuw24u0wmfyh",
//         "domainName": "kzo6ksoiakaqwztrvo7ukuw24u0wmfyh.lambda-url.us-east-2.on.aws",
//         "domainPrefix": "kzo6ksoiakaqwztrvo7ukuw24u0wmfyh",
//         "http": {
//             "method": "POST",
//             "path": "/",
//             "protocol": "HTTP/1.1",
//             "sourceIp": "44.197.108.94",
//             "userAgent": "Slackbot 1.0 (+https://api.slack.com/robots)"
//         },
//         "requestId": "3161abfb-3920-4a1a-b73b-881c9d7ea5a2",
//         "routeKey": "$default",
//         "stage": "$default",
//         "time": "17/Oct/2024:09:51:13 +0000",
//         "timeEpoch": 1729158673845
//     },
//     "body": "dG9rZW49Z2I3Mkt3UElCRWxiaU9YTzlDWkdNWmppJnRlYW1faWQ9VEg5OVdLUjVZJnRlYW1fZG9tYWluPWRvdWJsZXVnYW1lcyZjaGFubmVsX2lkPUMwN01TOUVQVjZVJmNoYW5uZWxfbmFtZT1ib3QtdGVzdCZ1c2VyX2lkPVUwMVVHRU5LS0YwJnVzZXJfbmFtZT1zdXllb24mY29tbWFuZD0lMkYlRUMlOTglQTQlRUMlQTAlOTAlRUIlQTglQjhfJUVCJThCJUI0JUVCJThCJUI5JUVDJTlFJTkwJnRleHQ9JmFwaV9hcHBfaWQ9QTA3TjlNVTNBTEImaXNfZW50ZXJwcmlzZV9pbnN0YWxsPWZhbHNlJnJlc3BvbnNlX3VybD1odHRwcyUzQSUyRiUyRmhvb2tzLnNsYWNrLmNvbSUyRmNvbW1hbmRzJTJGVEg5OVdLUjVZJTJGNzg4NzYwNTA1NTIwNiUyRlRxdlNTbUhHbU1rc1k1aTlBbUlDbVc0VyZ0cmlnZ2VyX2lkPTc4OTQyMzAyODcxNTQuNTg3MzM2NjcxMjAyLjhmNjBjM2VhZTM3NzUyOWUyMDE0NzI0N2ZlM2FmMWIx",
//     "isBase64Encoded": true
// })
// await handler({ body: JSON.stringify({ type: OJMDefine.LAMBDA_FUNC.ASK_LUNCH_MENU }) });
// await handler({body: JSON.stringify({ type: OJMDefine.LAMBDA_FUNC.REMIND_ORDER })});
// await handler({ body: JSON.stringify({ command: "/오점머_담당자" }) });