
export class Utils {
    /**
     * @returns 월요일(1) ~ 금요일(5)에 대해 0~4로 매핑
     */
    static getWeekdayIndex() {
        const today = new Date();
        const dayOfWeek = today.getDay();

        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            return dayOfWeek - 1;
        } else {
            return;
        }
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