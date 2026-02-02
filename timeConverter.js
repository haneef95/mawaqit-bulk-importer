/**
 * Time Converter Utility for Mawaqit Bulk Calendar Importer
 * Converts 12-hour format times to 24-hour format based on prayer context
 * Also handles DST to Standard time conversion for all timezones
 */

const TimeConverter = {
    /**
     * Default prayer columns and their conversion rules
     * - Fajr/Shuruq: Always AM (no conversion needed)
     * - Dhuhr: Add 12 if hour < 5 (handles 1:30 PM entered as 1:30)
     * - Asr/Maghrib/Isha: Add 12 if hour < 12
     */
    defaultRules: {
        'fajr': { addTwelve: false },
        'shuruq': { addTwelve: false },
        'dhuhr': { addTwelve: true, threshold: 5 },
        'asr': { addTwelve: true, threshold: 12 },
        'maghrib': { addTwelve: true, threshold: 12 },
        'isha': { addTwelve: true, threshold: 12 }
    },

    /**
     * Get prayer rules with optional custom thresholds
     * @param {Object} customThresholds - Optional custom thresholds {dhuhr, asr, maghrib, isha}
     * @param {boolean} disableConversion - If true, disables all conversion
     * @returns {Object} Prayer rules object
     */
    getPrayerRules(customThresholds = {}, disableConversion = false) {
        if (disableConversion) {
            return {
                'fajr': { addTwelve: false },
                'shuruq': { addTwelve: false },
                'dhuhr': { addTwelve: false },
                'asr': { addTwelve: false },
                'maghrib': { addTwelve: false },
                'isha': { addTwelve: false }
            };
        }

        return {
            'fajr': { addTwelve: false },
            'shuruq': { addTwelve: false },
            'dhuhr': { addTwelve: true, threshold: customThresholds.dhuhr ?? 5 },
            'asr': { addTwelve: true, threshold: customThresholds.asr ?? 12 },
            'maghrib': { addTwelve: true, threshold: customThresholds.maghrib ?? 12 },
            'isha': { addTwelve: true, threshold: customThresholds.isha ?? 12 }
        };
    },

    /**
     * Get column headers based on calendar type
     * @param {string} calendarType - 'calendar' for Athan, 'iqamaCalendar' for Iqama
     * @returns {string[]} Array of prayer names for each column index
     */
    getColumnHeaders(calendarType) {
        if (calendarType === 'calendar') {
            // Athan format: Month, Day, Fajr, Shuruq, Dhuhr, Asr, Maghrib, Isha
            return ['month', 'day', 'fajr', 'shuruq', 'dhuhr', 'asr', 'maghrib', 'isha'];
        } else {
            // Iqama format: Month, Day, Fajr, Dhuhr, Asr, Maghrib, Isha (no Shuruq)
            return ['month', 'day', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
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
     * @param {string} prayerName - Name of the prayer (fajr, dhuhr, asr, etc.)
     * @param {Object} prayerRules - Prayer rules object (defaults to defaultRules)
     * @returns {{value: string, converted: boolean, error: string|null}} Conversion result
     */
    convertTime(timeStr, prayerName, prayerRules = this.defaultRules) {
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
        const rule = prayerRules[prayerName.toLowerCase()];

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
     * @param {Object} prayerRules - Prayer rules object (defaults to defaultRules)
     * @returns {{columns: string[], conversions: number, errors: string[]}} Converted row data
     */
    convertRow(columns, calendarType, prayerRules = this.defaultRules) {
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
                const converted = this.convertTime(timeStr, prayerName, prayerRules);
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
    },

    /**
     * Get timezone offset in minutes for a specific date and timezone
     * @param {Date} date - Date to check
     * @param {string} timeZone - IANA timezone identifier (e.g., 'Europe/London')
     * @returns {number} Offset in minutes from UTC (negative for east of UTC)
     */
    getTimezoneOffsetMinutes(date, timeZone) {
        const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
        return (utcDate - tzDate) / 60000;
    },

    /**
     * Check if a date is in DST for a given timezone
     * Returns the DST offset adjustment needed (in minutes)
     * @param {number} month - Month (1-12)
     * @param {number} day - Day of month (1-31)
     * @param {string} timeZone - IANA timezone identifier
     * @returns {number} Minutes to subtract (0 if not in DST, 60 if in DST)
     */
    getDstAdjustment(month, day, timeZone) {
        if (!timeZone || timeZone === 'auto') {
            return 0;
        }

        try {
            const year = new Date().getFullYear();
            const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
            
            // Get offset for January (standard time in northern hemisphere)
            const janDate = new Date(Date.UTC(year, 0, 15, 12, 0, 0));
            const janOffset = this.getTimezoneOffsetMinutes(janDate, timeZone);
            
            // Get offset for July (DST in northern hemisphere, standard in southern)
            const julDate = new Date(Date.UTC(year, 6, 15, 12, 0, 0));
            const julOffset = this.getTimezoneOffsetMinutes(julDate, timeZone);
            
            // Get offset for target date
            const dateOffset = this.getTimezoneOffsetMinutes(date, timeZone);
            
            // If offsets are the same, timezone doesn't observe DST
            if (janOffset === julOffset) {
                return 0;
            }
            
            // Determine which offset is standard time (the one closer to UTC, i.e., less negative for east)
            // For timezones east of UTC (negative offsets), smaller magnitude means closer to UTC
            // For timezones west of UTC (positive offsets), larger value means closer to UTC
            const isNorthernHemisphere = janOffset < julOffset;
            
            if (isNorthernHemisphere) {
                // January offset is more negative = further from UTC = DST not active
                // So if current date has same offset as July, it's in DST
                return dateOffset === julOffset ? 60 : 0;
            } else {
                // Southern hemisphere: July is standard, January is DST
                return dateOffset === janOffset ? 60 : 0;
            }
        } catch (error) {
            console.warn(`DST detection error for ${timeZone}:`, error);
            return 0;
        }
    },

    /**
     * Subtract minutes from a time string
     * @param {string} timeStr - Time string in HH:MM format
     * @param {number} minutesToSubtract - Minutes to subtract
     * @returns {string} Adjusted time string
     */
    subtractMinutes(timeStr, minutesToSubtract) {
        if (!timeStr || !timeStr.trim() || minutesToSubtract === 0) {
            return timeStr;
        }

        const parsed = this.parseTime(timeStr);
        if (!parsed) {
            return timeStr;
        }

        let { hours, minutes } = parsed;
        let totalMinutes = hours * 60 + minutes - minutesToSubtract;
        
        // Handle negative times (shouldn't happen with DST adjustment, but just in case)
        if (totalMinutes < 0) {
            totalMinutes += 24 * 60;
        }
        
        const newHours = Math.floor(totalMinutes / 60) % 24;
        const newMinutes = totalMinutes % 60;
        
        return this.formatTime(newHours, newMinutes);
    },

    /**
     * Convert row times from local DST to standard time (winter time)
     * @param {string[]} columns - Array of column values from CSV row
     * @param {string} calendarType - 'calendar' for Athan, 'iqamaCalendar' for Iqama
     * @param {string} timeZone - IANA timezone identifier
     * @returns {{columns: string[], dstAdjustments: number}} Row with DST-adjusted times
     */
    convertDstToStandard(columns, calendarType, timeZone) {
        const headers = this.getColumnHeaders(calendarType);
        const month = parseInt(columns[0], 10);
        const day = parseInt(columns[1], 10);
        
        const result = {
            columns: [...columns],
            dstAdjustments: 0
        };

        if (!month || !day || isNaN(month) || isNaN(day)) {
            return result;
        }

        const dstAdjustment = this.getDstAdjustment(month, day, timeZone);
        
        if (dstAdjustment > 0) {
            // Apply DST adjustment to all time columns (starting from index 2)
            for (let i = 2; i < columns.length && i < headers.length; i++) {
                const timeStr = columns[i]?.trim();
                if (timeStr) {
                    const adjustedTime = this.subtractMinutes(timeStr, dstAdjustment);
                    if (adjustedTime !== timeStr) {
                        result.columns[i] = adjustedTime;
                        result.dstAdjustments++;
                    }
                }
            }
        }

        return result;
    }
};
