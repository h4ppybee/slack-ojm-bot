import AWS from 'aws-sdk';

// export const handler = async (event) => {
//     const body = JSON.parse(event.body);  // Slack에서 받은 요청 본문
//     const responseUrl = body.response_url; // Slack에 응답할 URL

//     // SQS 메시지에 전달할 내용 (채널 ID 및 작업 내용 포함)
//     const sqsMessage = {
//         MessageBody: JSON.stringify({
//             channel_id: body.channel_id,
//             user_id: body.user_id,
//             command: body.text,
//             response_url: responseUrl
//         }),
//         QueueUrl: QUEUE_URL
//     };

//     // SQS에 비동기 작업 메시지 전달
//     await sqs.sendMessage(sqsMessage).promise();

export class SQSService {
    constructor() {
        this.sqs = new AWS.SQS();
        this.QUEUE_URL = process.env.SQS_URL;
    }

    async sendMessage(body) {

    }
}