import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
export class SQSService {
    constructor() {
        this.sqs = new AWS.SQS();
        this.QUEUE_URL = process.env.SQS_URL;
    }

    async sendMessage(message) {
        const sqsMessage = {
            MessageBody: message.toJsonString(),
            QueueUrl: this.QUEUE_URL,
            MessageGroupId: 'slack-bot',
            MessageDeduplicationId: uuidv4()
        };

        await this.sqs.sendMessage(sqsMessage).promise();
        console.log(sqsMessage);
    }
}

export class SQSMessage {
    constructor(type, message) {
        this.type = type;
        this.message = message;
    }

    toJsonString() {
        return JSON.stringify(this);
    }
}