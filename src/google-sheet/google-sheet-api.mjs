import axios from 'axios';

export class GoogleSheetService {
    static async requestGet() {
        console.log("requestGet()")
        const url = process.env.GOOGLE_SHEET;
        try {
            const response = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.status === 200) {
                if (response.data.status == "success") {
                    console.log('Response from Apps Script:\n', response.data);
                    return response.data;
                } else if (response.data.status == "fail") {
                    console.log('Fail Load Sheet:\n', response.message);
                    return undefined;
                }
            }
        } catch (error) {
            console.error('Error calling Apps Script:\n', error);
        }
    }
    static async requestGetByChannelID(channel_id) {
        const sheetData = await this.requestGet();
        if (sheetData === undefined) return undefined;
        const result = sheetData.data.find(d => d[0] == channel_id)
        return result;
    }

    // 업서트(upsert) 요청
    static async requestUpsert(data) {
        const url = process.env.GOOGLE_SHEET;
        try {
            const req = {
                action: 'upsert',
                data: data
            };

            const response = await axios.post(url, req, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Response from Google Apps Script:\n', response.data);
            return true;
        } catch (error) {
            console.error('Error making upsert request:\n', error);
            return false;
        }
    }

    // 삭제 요청
    static async requestDelete(channelId) {
        const url = process.env.GOOGLE_SHEET;
        try {
            const req = {
                action: 'delete',
                data: channelId
            };

            const response = await axios.post(url, req, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response from Google Apps Script:\n', response.data);
        } catch (error) {
            console.error('Error making delete request:\n', error);
        }
    }
}