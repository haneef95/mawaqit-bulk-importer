/**
 * Time Converter Utility for Mawaqit Bulk Calendar Importer
 * Converts 12-hour format times to 24-hour format based on prayer context
 */

const TimeConverter = {
    /**
     * Prayer columns and their conversion rules
     * - Fajr/Shuruk: Always AM (no conversion needed)
     * - Duhr: Add 12 if hour < 5 (handles 1:30 PM entered as 1:30)
     * - Asr/Maghrib/Isha: Add 12 if hour < 12
     */
    prayerRules: {
        'fajr': { addTwelve: false },
        'shuruk': { addTwelve: false },
        'sunrise': { addTwelve: false },
        'duhr': { addTwelve: true, threshold: 5 },
        'dhuhr': { addTwelve: true, threshold: 5 },
        'zuhr': { addTwelve: true, threshold: 5 },
        'asr': { addTwelve: true, threshold: 12 },
        'maghrib': { addTwelve: true, threshold: 12 },
        'isha': { addTwelve: true, threshold: 12 }
    },

    /**
     * Get column headers based on calendar type
     * @param {string} calendarType - 'calendar' for Athan, 'iqamaCalendar' for Iqama
     * @returns {string[]} Array of prayer names for each column index
     */
    getColumnHeaders(calendarType) {
        if (calendarType === 'calendar') {
            // Athan format: Month, Day, Fajr, Shuruk, Duhr, Asr, Maghrib, Isha
            return ['month', 'day', 'fajr', 'shuruk', 'duhr', 'asr', 'maghrib', 'isha'];
        } else {
            // Iqama format: Month, Day, Fajr, Duhr, Asr, Maghrib, Isha
            return ['month', 'day', 'fajr', 'duhr', 'asr', 'maghrib', 'isha'];
        }
    },

    /**
     * Parse a time string and extract hours and minutes
     * @param {string} timeStr - Time string (e.g., "6:30", "06:30", "14:30")
     * @returns {{hours: number, minutes: number}|null} Parsed time or null if invalid
     */
    parseTime(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') {
            return null;
        }

        const cleaned = timeStr.trim();
        const match = cleaned.match(/^(\d{1,2}):(\d{2})$/);

        if (!match) {
            return null;
        }

        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);

        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return null;
        }

        return { hours, minutes };
    },

    /**
     * Format hours and minutes to HH:MM string
     * @param {number} hours - Hours (0-23)
     * @param {number} minutes - Minutes (0-59)
     * @returns {string} Formatted time string
     */
    formatTime(hours, minutes) {
        const h = hours.toString().padStart(2, '0');
        const m = minutes.toString().padStart(2, '0');
        return `${h}:${m}`;
    },

    /**
     * Convert time to 24-hour format based on prayer type
     * @param {string} timeStr - Input time string
     * @param {string} prayerName - Name of the prayer (fajr, duhr, asr, etc.)
     * @returns {{value: string, converted: boolean, error: string|null}} Conversion result
     */
    convertTime(timeStr, prayerName) {
        const result = {
            value: timeStr,
            converted: false,
            error: null
        };

        if (!timeStr || !timeStr.trim()) {
            return result;
        }

        const parsed = this.parseTime(timeStr);
        if (!parsed) {
            result.error = `Invalid time format: "${timeStr}"`;
            return result;
        }

        let { hours, minutes } = parsed;
        const rule = this.prayerRules[prayerName.toLowerCase()];

        if (rule && rule.addTwelve && hours < rule.threshold) {
            hours += 12;
            result.converted = true;
        }

        result.value = this.formatTime(hours, minutes);
        return result;
    },

    /**
     * Convert all times in a CSV row
     * @param {string[]} columns - Array of column values from CSV row
     * @param {string} calendarType - 'calendar' for Athan, 'iqamaCalendar' for Iqama
     * @returns {{columns: string[], conversions: number, errors: string[]}} Converted row data
     */
    convertRow(columns, calendarType) {
        const headers = this.getColumnHeaders(calendarType);
        const result = {
            columns: [...columns],
            conversions: 0,
            errors: []
        };

        for (let i = 2; i < columns.length && i < headers.length; i++) {
            const prayerName = headers[i];
            const timeStr = columns[i]?.trim();

            if (timeStr) {
                const converted = this.convertTime(timeStr, prayerName);
                result.columns[i] = converted.value;

                if (converted.converted) {
                    result.conversions++;
                }

                if (converted.error) {
                    result.errors.push(`Column ${i + 1} (${prayerName}): ${converted.error}`);
                }
            }
        }

        return result;
    }
};
