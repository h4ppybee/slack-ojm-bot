
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
} 