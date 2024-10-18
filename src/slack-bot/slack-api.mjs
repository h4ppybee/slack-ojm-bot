import { WebClient } from "@slack/web-api";

export class SlackService {

    init() {
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
            return {
                statusCode: 200,
                body: JSON.stringify(result.ts),
            };
        } catch (error) {
            console.error(`Error sending message: ${error}`);
            return {
                statusCode: 500,
                body: JSON.stringify(error),
            };
        }
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
                body: JSON.stringify({ text: '담당자 지정 폼을 작성해주세요' }),
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