export interface SafeDateFormatOptions {
    year?: 'numeric' | '2-digit';
    month?: 'numeric' | '2-digit' | 'long' | 'short';
    day?: 'numeric' | '2-digit';
    weekday?: 'long' | 'short';
    hour?: 'numeric' | '2-digit';
    minute?: 'numeric' | '2-digit';
}

const MONTHS_EN_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_EN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_AR_LONG = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/**
 * Platform-safe date formatting helper that avoids iOS JavaScriptCore range errors.
 * 
 * @param dateInput string, Date object, or timestamp
 * @param language 'en', 'ar', etc.
 * @param options SafeDateFormatOptions mapping to standard Intl options
 */
export const formatDateSafe = (
    dateInput: string | Date | number,
    language: string = 'en',
    options: SafeDateFormatOptions = {}
): string => {
    try {
        if (!dateInput) return '';
        const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
        if (isNaN(date.getTime())) {
            return typeof dateInput === 'string' ? dateInput : '';
        }

        const isAr = language === 'ar' || language.startsWith('ar');

        // Extract components
        const year = date.getFullYear();
        const monthIdx = date.getMonth();
        const day = date.getDate();
        const weekdayIdx = date.getDay();
        const hours = date.getHours();
        const minutes = date.getMinutes();

        // 1. Handle weekday
        let weekdayStr = '';
        if (options.weekday) {
            weekdayStr = isAr ? WEEKDAYS_AR[weekdayIdx] : WEEKDAYS_EN[weekdayIdx];
        }

        // 2. Handle month
        let monthStr = '';
        if (options.month === 'long') {
            monthStr = isAr ? MONTHS_AR_LONG[monthIdx] : MONTHS_EN_LONG[monthIdx];
        } else if (options.month === 'short') {
            monthStr = isAr ? MONTHS_AR_LONG[monthIdx] : MONTHS_EN_SHORT[monthIdx];
        } else {
            const num = monthIdx + 1;
            monthStr = options.month === '2-digit' && num < 10 ? `0${num}` : `${num}`;
        }

        // 3. Handle day
        const dayStr = options.day === '2-digit' && day < 10 ? `0${day}` : `${day}`;

        // 4. Handle year
        const yearStr = options.year === '2-digit' ? `${year}`.slice(-2) : `${year}`;

        // Build main date string
        let result = '';
        if (options.weekday && options.month && options.day && options.year) {
            if (isAr) {
                result = `${weekdayStr}، ${dayStr} ${monthStr} ${yearStr}`;
            } else {
                result = `${weekdayStr}, ${monthStr} ${dayStr}, ${yearStr}`;
            }
        } else if (options.month && options.year && !options.day) {
            result = `${monthStr} ${yearStr}`;
        } else if (options.month && options.day && options.year) {
            if (isAr) {
                result = `${dayStr} ${monthStr} ${yearStr}`;
            } else {
                result = `${monthStr} ${dayStr}, ${yearStr}`;
            }
        } else if (options.month && options.day) {
            if (isAr) {
                result = `${dayStr} ${monthStr}`;
            } else {
                result = `${monthStr} ${dayStr}`;
            }
        } else {
            if (isAr) {
                result = `${dayStr}/${monthIdx + 1}/${yearStr}`;
            } else {
                result = `${monthIdx + 1}/${dayStr}/${yearStr}`;
            }
        }

        // 5. Handle time (hour, minute)
        if (options.hour || options.minute) {
            let period = '';
            let displayHours = hours;
            if (isAr) {
                period = hours >= 12 ? 'م' : 'ص';
                displayHours = hours % 12 || 12;
            } else {
                period = hours >= 12 ? 'PM' : 'AM';
                displayHours = hours % 12 || 12;
            }
            
            const padMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
            const timeStr = `${displayHours}:${padMinutes} ${period}`;
            
            if (result) {
                result = isAr ? `${result}، ${timeStr}` : `${result}, ${timeStr}`;
            } else {
                result = timeStr;
            }
        }

        return result;
    } catch (e) {
        console.error('Error in formatDateSafe:', e);
        return typeof dateInput === 'string' ? dateInput : '';
    }
};
