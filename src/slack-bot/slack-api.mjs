import { WebClient } from "@slack/web-api";

export class SlackService {

    constructor() {
        this.token = process.env.SLACK_BOT_OAUTH_TOKEN;
        this.web = new WebClient(this.token);
    }

    async sendMessage(channelId, text) {
        try {
            const result = await this.web.chat.postMessage({
                channel: channelId,
                text: text,
            });
            console.log(`Message sent at ${result.ts}`);
            return result;
        } catch (error) {
            console.error(`Error sending message: ${error}`);
            return {
                statusCode: 500,
                body: JSON.stringify(error),
            };
        }
    }

    async updateMessage(channelId, ts, text) {
        const response = await this.web.chat.update({
            channel: channelId,
            ts: ts,
            text: text,
        });

        if (response.ok) {
            console.log('메시지가 수정되었습니다:', response);
            return response;
        } else {
            console.error('메시지 수정 중 오류 발생:', response.error);
            return response.error;
        }
    }

    async sendResult(responseUrl, result) {
        await fetch(responseUrl, {
            method: 'POST',
            body: result,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // 모달 창을 띄우는 함수
    async openModal(trigger_id, channel_id) {
        try {
            const result = await this.web.views.open({
                trigger_id: trigger_id,
                view: {
                    type: 'modal',
                    callback_id: process.env.REGISTER_MODAL_ID,
                    title: {
                        type: 'plain_text',
                        text: '오점머 등록'
                    },
                    blocks: [
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: '각 요일에 배달 담당자를 지정해주세요!'
                            }
                        },
                        ...this.createUserTagInputs(['월요일', '화요일', '수요일', '목요일', '금요일']),
                    ],
                    private_metadata: JSON.stringify({ channel_id: channel_id }),
                    submit: {
                        type: 'plain_text',
                        text: '오점머 등록'
                    }
                }
            });
            console.log(result);
            return {
                statusCode: 200,
                body: "",
            };
        } catch (error) {
            console.error(':x:모달창 오픈 에러 발생!:x:\n', error);
            return {
                statusCode: 500,
                body: JSON.stringify(error),
            };
        }
    }

    // 각 요일별 사용자 태그 입력 블록을 생성하는 함수
    createUserTagInputs(weekdays) {
        return weekdays.map((day, index) => ({
            type: 'input',
            block_id: `block_${index}`,
            label: {
                type: 'plain_text',
                text: `${day}`
            },
            element: {
                type: 'users_select',
                placeholder: {
                    type: 'plain_text',
                    text: '담당자 선택'
                },
                action_id: `user_select_${index}`
            }
        }));
    }
}