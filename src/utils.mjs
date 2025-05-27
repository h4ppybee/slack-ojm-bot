
import { getHolidaysByMonthCount, setServiceKey } from 'holidays-kr';

export class Utils {
    /**
     * @returns 월요일(1) ~ 금요일(5)에 대해 0~4로 매핑
     */
    static getWeekIdx(date = new Date()) {
        const kstDate = this.getKSTDate(date);
        const dayOfWeek = kstDate.getDay();

        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            return dayOfWeek - 1;
        } else {
            return;
        }
    }

    /**
     * 한국 기준 워킹데이(월~금, 공휴일 제외) 여부 반환
     * @returns {boolean} 워킹데이면 true, 아니면 false
     */
    static async isWorkingDayAsync(date = new Date()) {
        const kstDate = this.getKSTDate(date);
        const dayOfWeek = kstDate.getDay();
        // 0: 일, 6: 토
        if (dayOfWeek === 0 || dayOfWeek === 6) return false;

        try {
            // 공휴일 체크 (holidays-kr)
            const year = kstDate.getFullYear();
            const month = kstDate.getMonth() + 1; // 1월이 0이므로 +1
            const day = kstDate.getDate();

            setServiceKey(process.env.HOLIDAY_SERVICE_KEY);
            const holidayList = await getHolidaysByMonthCount(year, month);
            const holiday = holidayList.filter(h => h.day === day);
            if (holiday.length > 0) {
                console.log(`공휴일=`, holiday[0].name);
                return false;
            }
        } catch (e) {
        }

        return true;
    }

    static getKSTDate(date) {
        const parsedDate = new Date(date.toISOString());
        parsedDate.setHours(parsedDate.getHours() + 9);
        return parsedDate;
    }

    static getUserListText(users) {
        return `:모코코_햄버거: *담당자 목록* :모코코_햄버거:\n` +
            `> 월 <@${users[0]}>` + '\n' +
            `> 화 <@${users[1]}>` + '\n' +
            `> 수 <@${users[2]}>` + '\n' +
            `> 목 <@${users[3]}>` + '\n' +
            `> 금 <@${users[4]}>`;
    }
} 