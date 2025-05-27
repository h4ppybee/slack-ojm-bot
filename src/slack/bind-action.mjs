import { SlackService } from './slack.api.mjs';
import { askLunchMenu, remindOrder, commandRegister, commandDelete, handleRegisterModal, commandList, asyncRegister, asyncGetList, asyncDelete } from './slack.controller.mjs';
import { OJMDefine } from './slack.define.mjs';
export async function action(event, isTest) {
    const actions = {
        [OJMDefine.LAMBDA_FUNC.ASK_LUNCH_MENU]: askLunchMenu,
        [OJMDefine.LAMBDA_FUNC.REMIND_ORDER]: remindOrder,
        [OJMDefine.LAMBDA_FUNC.COMMAND_REGISTER]: commandRegister,
        [OJMDefine.LAMBDA_FUNC.COMMAND_DELETE]: commandDelete,
        [OJMDefine.LAMBDA_FUNC.COMMAND_LIST]: commandList,
    };

    if (event.payload) {
        // 모달 창
        const payload = JSON.parse(event.payload)
        console.log('Parsed payload:', payload);
        if (payload.type === 'view_submission') {
            return await handleRegisterModal(payload);
        }
    } else if (actions[event.type]) {
        // 트리거
        return await actions[event.type](event, isTest);
    } else if (actions[event.command]) {
        // 커맨드 명령어
        return await actions[event.command](event);
    } else {
        console.error(`No action : ${event.type}`)
    }
}

export async function queueAction(record) {
    const actions = {
        [OJMDefine.SQS_TYPE.REGISTER]: asyncRegister,
        [OJMDefine.SQS_TYPE.GET_LIST]: asyncGetList,
        [OJMDefine.SQS_TYPE.DELETE]: asyncDelete,
    }

    const body = JSON.parse(record.body);
    if (actions[body.type]) {
        return await actions[body.type](body.message);
    } else {
        console.error(`No action : ${body.type}`)
    }
}