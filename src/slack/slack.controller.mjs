import { GoogleSheetService } from "../google-sheet/google-sheet-api.mjs";
import { SQSMessage, SQSService } from "../sqs/sqs.service.mjs";
import { Utils } from "../utils.mjs";
import { SlackService } from "./slack.api.mjs";
import { OJMDefine } from "./slack.define.mjs";

//#region 스케쥴러
export async function askLunchMenu(e, isTest) {
    console.log("askLunchMenu()");

    const isWorkingDay = await Utils.isWorkingDayAsync();
    if (!isWorkingDay) {
        return {
            statusCode: 200,
            body: JSON.stringify({ message: '공휴일입니다.' }),
        };
    }

    const weekdayIdx = Utils.getWeekIdx();
    const slackService = new SlackService()
    if (isTest) {
        if (e.channel_id) {
            // 특정 채널에만 메시지 전송
            const result = await GoogleSheetService.requestGetByChannelID(e.channel_id);
            if (!result) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: '등록된 담당자가 없습니다.' }),
                };
            }
            const [channelId, ...managers] = result;
            if (channelId && managers[weekdayIdx]) {
                await slackService.sendMessage(channelId, `<@${managers[weekdayIdx]}> 오점머? :모코코_햄버거:`);
            }
            return { statusCode: 200, body: 'test' };
        }
    } else {
        // 전체 채널에 메시지 전송(기존 동작)
        const result = await GoogleSheetService.requestGet();
        for (let loop = 0, size = result.data.length; loop < size; loop++) {
            const channels = result.data[loop];
            const [channelId, ...managers] = channels;
            if (channelId != '' && managers[weekdayIdx]) {
                await slackService.sendMessage(channelId, `<@${managers[weekdayIdx]}> 오점머? :모코코_햄버거:`)
            }
        }
        return { statusCode: 200, body: 'product' };
    }
    return { statusCode: 400, body: 'fail' };
}

export async function remindOrder(e, isTest) {
    console.log("remindOrder()");
    const isWorkingDay = await Utils.isWorkingDayAsync();
    if (!isWorkingDay) {
        return {
            statusCode: 200,
            body: JSON.stringify({ message: '공휴일입니다.' }),
        };
    }

    const weekdayIdx = Utils.getWeekIdx();
    const slackService = new SlackService();
    if (isTest) {
        if (e.channel_id) {
            // 특정 채널에만 메시지 전송
            const result = await GoogleSheetService.requestGetByChannelID(e.channel_id);
            if (!result) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: '등록된 담당자가 없습니다.' }),
                };
            }
            const [channelId, ...managers] = result;
            if (channelId != '') {
                await slackService.sendMessage(channelId, `<@${managers[weekdayIdx]}> 배달 주문 시간이에용 :모코코_인사:\n:heavy_check_mark:수저 포크\n:heavy_check_mark:법카`)
            }
            return { statusCode: 200, body: 'test' };
        }
    } else {
        const result = await GoogleSheetService.requestGet();
        for (let loop = 0, size = result.data.length; loop < size; loop++) {
            const channels = result.data[loop];
            const [channelId, ...managers] = channels;
            if (channelId != '') {
                await slackService.sendMessage(channelId, `<@${managers[weekdayIdx]}> 배달 주문 시간이에용 :모코코_인사:\n:heavy_check_mark:수저 포크\n:heavy_check_mark:법카`)
            }
        }
        return { statusCode: 200, body: 'product' };
    }
    return { statusCode: 400, body: 'fail' };
}

//#region 커맨드
export async function commandRegister(e) {
    console.log("commandRegister()");
    const { trigger_id, channel_id } = e;
    const slackService = new SlackService();
    return await slackService.openRegisterModal(trigger_id, channel_id);
}

export async function handleRegisterModal(e) {
    console.log("handleRegisterModal()");
    const mondayUser = e.view.state.values['block_0']['user_select_0'].selected_user;
    const tuesdayUser = e.view.state.values['block_1']['user_select_1'].selected_user;
    const wednesdayUser = e.view.state.values['block_2']['user_select_2'].selected_user;
    const thursdayUser = e.view.state.values['block_3']['user_select_3'].selected_user;
    const fridayUser = e.view.state.values['block_4']['user_select_4'].selected_user;
    const channelId = JSON.parse(e.view.private_metadata).channel_id;

    const slackService = new SlackService();
    const res = await slackService.sendMessage(channelId, "알림 설정 중.. :모코코_도망:");

    const sqsService = new SQSService();
    await sqsService.sendMessage(new SQSMessage(OJMDefine.SQS_TYPE.REGISTER,
        {
            channel_id: channelId,
            users: [mondayUser, tuesdayUser, wednesdayUser, thursdayUser, fridayUser],
            message_ts: res.ts
        }));
    return {
        statusCode: 200,
        body: JSON.stringify({
            response_action: 'clear'
        }),
    };
}

export async function asyncRegister(e) {
    const slackService = new SlackService();
    if (await GoogleSheetService.requestUpsert([e.channel_id, ...e.users])) {
        return await slackService.updateMessage(e.channel_id, e.message_ts, "오점머 알림 예약 완료! :모코코_인사:\n-----------------------------------\n" + Utils.getUserListText(e.users));
    } else {
        return await slackService.updateMessage(e.channel_id, e.message_ts, ":x: 오점머 알림 예약 실패..");
    }
}

export async function commandDelete(e) {
    console.log("commandDelete()");
    const slackService = new SlackService();
    const res = await slackService.sendMessage(e.channel_id, "알림 삭제 중.. :모코코_도망:");

    const sqsService = new SQSService();
    await sqsService.sendMessage(new SQSMessage(OJMDefine.SQS_TYPE.DELETE,
        {
            channel_id: e.channel_id,
            message_ts: res.ts
        }));
    return {
        statusCode: 200,
        body: ""
    };
}

export async function asyncDelete(e) {
    const slackService = new SlackService();
    await GoogleSheetService.requestDelete(e.channel_id);
    return await slackService.updateMessage(e.channel_id, e.message_ts, "오점머 알림이 삭제되었어요 :모코코_눈물:");
}

export async function commandList(e) {
    console.log("commandList()");
    const slackService = new SlackService();
    const res = await slackService.sendMessage(e.channel_id, "데이터 불러오는 중.. :모코코_도망:");

    const sqsService = new SQSService();
    await sqsService.sendMessage(new SQSMessage(OJMDefine.SQS_TYPE.GET_LIST,
        {
            channel_id: e.channel_id,
            message_ts: res.ts
        }));
    return {
        statusCode: 200,
        body: ""
    };
}

export async function asyncGetList(e) {
    const slackService = new SlackService();
    const result = await GoogleSheetService.requestGetByChannelID(e.channel_id);
    if (result === undefined) {
        return await slackService.updateMessage(e.channel_id, e.message_ts, ":x: 이 채널에 등록된 알림이 없습니다 :x:");
    }

    const [channelId, ...managers] = result;
    const weekdayIdx = Utils.getWeekIdx();
    let prefix = '';
    if (weekdayIdx >= 0) {
        prefix = `:rice_ball: 오늘의 담당: <@${managers[weekdayIdx]}> :rice_ball:\n-----------------------------------\n`;
    }
    let message = prefix + Utils.getUserListText(managers);
    console.log(message);
    return await slackService.updateMessage(channelId, e.message_ts, message);
}