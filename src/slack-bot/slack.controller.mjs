import { GoogleSheetService } from "../google-sheet/google-sheet-api.mjs";
import { Utils } from "../utils.mjs";
import { SlackService } from "./slack-api.mjs";

//#region 스케쥴러
export async function askLunchMenu(e) {
    console.log("askLunchMenu()");
    const weekdayIdx = Utils.getWeekdayIndex();
    if (weekdayIdx < 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: ':x:주말입니다.' }),
        };
    }

    const result = await GoogleSheetService.requestGet();
    const slackService = new SlackService();
    slackService.init();
    for (let loop = 0, size = result.data.length; loop < size; loop++) {
        const channels = result.data[loop];
        const [channelId, ...managers] = channels;
        await slackService.sendMessage(channelId, `<@${managers[weekdayIdx]}> 오점머? :모코코_햄버거:`)
    }
}

export async function remindOrder(e) {
    console.log("remindOrder()");
    const weekdayIdx = Utils.getWeekdayIndex();
    if (weekdayIdx < 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: ':x:주말입니다.' }),
        };
    }

    const result = await GoogleSheetService.requestGet();
    const slackService = new SlackService();
    slackService.init();
    for (let loop = 0, size = result.data.length; loop < size; loop++) {
        const channels = result.data[loop];
        const [channelId, ...managers] = channels;
        await slackService.sendMessage(channelId, `<@${managers[weekdayIdx]}> 배달 주문 시간이에용 :모코코_인사:\n:heavy_check_mark:수저 포크\n:heavy_check_mark:법카`)
    }
}

//#region 커맨드
export async function commandRegister(e) {
    console.log("commandRegister()");
    const { trigger_id, channel_id } = e;
    const slackService = new SlackService();
    slackService.init();
    return await slackService.openModal(trigger_id, channel_id);
}

export async function handleRegisterModal(e) {
    console.log("handleRegisterModal()");
    const mondayUser = e.view.state.values['block_0']['user_select_0'].selected_user;
    const tuesdayUser = e.view.state.values['block_1']['user_select_1'].selected_user;
    const wednesdayUser = e.view.state.values['block_2']['user_select_2'].selected_user;
    const thursdayUser = e.view.state.values['block_3']['user_select_3'].selected_user;
    const fridayUser = e.view.state.values['block_4']['user_select_4'].selected_user;

    const channelId = JSON.parse(e.view.private_metadata).channel_id;

    // 3초이내에 200보내야해서 await생략
    GoogleSheetService.requestUpsert([channelId, mondayUser, tuesdayUser, wednesdayUser, thursdayUser, fridayUser]);

    return {
        statusCode: 200,
        body: JSON.stringify({
            response_action: 'clear',
            text: "오점머 알림 예약 완료! :모코코_인사:",
            response_type: "in_channel"
        }),
    };
}

export async function asyncRegister(e) {

}

export async function commandDelete(e) {
    console.log("commandDelete()");
    await GoogleSheetService.requestDelete(e.channel_id);
    return {
        statusCode: 200,
        body: JSON.stringify({
            text: "오점머 알림이 취소되었어요 :모코코_눈물:",
            response_type: "in_channel"
        })
    };
}

export async function asyncDelete(e) {

}

export async function commandList(e) {
    console.log("commandList()");

    return {
        statusCode: 200,
        body: JSON.stringify({
            text: "데이터 불러오는 중.."
        })
    };
}

export async function asyncGetList(e) {
    const result = await GoogleSheetService.requestGetByChannelID(e.channel_id);
    if (result === undefined) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                text: ":x: 이 채널에 등록된 알림이 없습니다 :x:",
                response_type: "in_channel"
            })
        };
    }

    const [channelId, ...managers] = result;
    const weekdayIdx = Utils.getWeekdayIndex();
    let prefix = '';
    if (weekdayIdx < 0) {
        prefix = `:rice_ball: 오늘의 담당: <@${managers[weekdayIdx]}> :rice_ball:\n-----------------------------------\n`
    }
    let message = prefix +
        `> 월 <@${managers[0]}>` + '\n' +
        `> 화 <@${managers[1]}>` + '\n' +
        `> 수 <@${managers[2]}>` + '\n' +
        `> 목 <@${managers[3]}>` + '\n' +
        `> 금 <@${managers[4]}>`;
    console.log(message);
    fetch(e.response_url, {
        method: 'POST',
        body: JSON.stringify({
            text: message,
            response_type: "in_channel"
        }),
        headers: { 'Content-Type': 'application/json' }
    });
    return message;
}