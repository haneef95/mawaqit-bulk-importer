/**
 * DST Converter Utility for Mawaqit Bulk Calendar Importer
 * Detects DST periods and converts times from DST to Standard Time
 */

const DSTConverter = {
    /**
     * Get the timezone from the Mawaqit configuration field
     * @returns {string|null} IANA timezone string (e.g., "Europe/London") or null if not found
     */
    getTimezoneFromPage() {
        const timezoneInput = document.getElementsByName('configuration[timezoneName]')[0];
        if (timezoneInput && timezoneInput.value) {
            return timezoneInput.value;
        }
        return null;
    },

    /**
     * Get timezone offset using Intl.DateTimeFormat for more accurate results
     * @param {Date} date - Date to check
     * @param {string} timezone - IANA timezone string
     * @returns {number} Offset in minutes from UTC (positive = behind UTC)
     */
    getTimezoneOffset(date, timezone) {
        try {
            // Create a formatter that gives us the timezone offset
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            
            // Get parts in the target timezone
            const parts = formatter.formatToParts(date);
            const getPart = (type) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
            
            const tzYear = getPart('year');
            const tzMonth = getPart('month') - 1;
            const tzDay = getPart('day');
            const tzHour = getPart('hour') === 24 ? 0 : getPart('hour');
            const tzMinute = getPart('minute');
            const tzSecond = getPart('second');
            
            // Create a date representing what the local time would be
            const tzDate = new Date(Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, tzSecond));
            
            // The offset is the difference between UTC time and local time
            return (date.getTime() - tzDate.getTime()) / 60000;
        } catch (error) {
            console.error('Error getting timezone offset:', error);
            return 0;
        }
    },

    /**
     * Find DST transitions for a given year and timezone
     * @param {string} timezone - IANA timezone string (e.g., "Europe/London")
     * @param {number} year - Year to check for DST transitions
     * @returns {{start: Date|null, end: Date|null, offset: number, startHour: number, endHour: number}} DST period info
     */
    findDSTTransitions(timezone, year) {
        const result = {
            start: null,
            end: null,
            offset: 0, // DST offset in minutes
            startHour: 0, // Hour when DST starts (local time)
            endHour: 0, // Hour when DST ends (local time)
            hasDST: false
        };

        try {
            // Check January and July for offset differences
            const jan1 = new Date(Date.UTC(year, 0, 1, 12, 0, 0));
            const jul1 = new Date(Date.UTC(year, 6, 1, 12, 0, 0));
            
            const janOffset = this.getTimezoneOffset(jan1, timezone);
            const julOffset = this.getTimezoneOffset(jul1, timezone);
            
            // If offsets are the same, no DST
            if (janOffset === julOffset) {
                return result;
            }

            result.hasDST = true;
            
            // Determine which is standard and which is DST
            // Standard time has a MORE POSITIVE offset (further behind UTC)
            // DST has a LESS POSITIVE offset (closer to UTC / clocks forward)
            const standardOffset = Math.max(janOffset, julOffset);
            const dstOffset = Math.min(janOffset, julOffset);
            result.offset = standardOffset - dstOffset; // DST offset in minutes

            // Find the exact transition dates using binary search for efficiency
            let prevOffset = janOffset;
            
            // Check each day to find transitions
            for (let month = 0; month < 12; month++) {
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                for (let day = 1; day <= daysInMonth; day++) {
                    // Check at noon UTC to get a stable reading for the day
                    const dateNoon = new Date(Date.UTC(year, month, day, 12, 0, 0));
                    const currentOffset = this.getTimezoneOffset(dateNoon, timezone);
                    
                    if (currentOffset !== prevOffset) {
                        // Found a transition on this day - find the exact hour
                        const transitionInfo = this.findExactTransitionHour(year, month, day, timezone, prevOffset, currentOffset);
                        
                        if (currentOffset === dstOffset) {
                            // Transitioning TO DST (clocks spring forward)
                            result.start = transitionInfo.date;
                            result.startHour = transitionInfo.hour;
                        } else {
                            // Transitioning FROM DST (clocks fall back)
                            result.end = transitionInfo.date;
                            result.endHour = transitionInfo.hour;
                        }
                        prevOffset = currentOffset;
                    }
                }
            }

        } catch (error) {
            console.error('Error detecting DST transitions:', error);
        }

        return result;
    },

    /**
     * Find the exact hour of a DST transition
     * @param {number} year - Year
     * @param {number} month - Month (0-11)
     * @param {number} day - Day of transition
     * @param {string} timezone - IANA timezone
     * @param {number} prevOffset - Previous offset
     * @param {number} newOffset - New offset after transition
     * @returns {{date: Date, hour: number}} Exact transition datetime and local hour
     */
    findExactTransitionHour(year, month, day, timezone, prevOffset, newOffset) {
        // Check the previous day's late hours and this day's early hours
        // DST transitions typically happen in early morning (1am-3am)
        
        // Start checking from the previous day at 20:00
        const prevDay = day - 1;
        const prevMonth = prevDay < 1 ? month - 1 : month;
        const actualPrevDay = prevDay < 1 ? new Date(year, month, 0).getDate() : prevDay;
        const actualYear = prevMonth < 0 ? year - 1 : year;
        const actualPrevMonth = prevMonth < 0 ? 11 : prevMonth;
        
        // Check hours around the transition
        for (let checkDay = 0; checkDay <= 1; checkDay++) {
            const d = checkDay === 0 ? actualPrevDay : day;
            const m = checkDay === 0 ? actualPrevMonth : month;
            const y = checkDay === 0 ? actualYear : year;
            
            for (let hour = (checkDay === 0 ? 20 : 0); hour < (checkDay === 0 ? 24 : 12); hour++) {
                const testDate = new Date(Date.UTC(y, m, d, hour, 0, 0));
                const offset = this.getTimezoneOffset(testDate, timezone);
                
                if (offset === newOffset) {
                    // Found the transition hour - return the actual local time
                    // The transition happens AT this hour in local time
                    return {
                        date: new Date(y, m, d, hour, 0, 0),
                        hour: hour
                    };
                }
            }
        }
        
        // Fallback - return the day at midnight
        return {
            date: new Date(year, month, day, 0, 0, 0),
            hour: 0
        };
    },

    /**
     * Check if a given date/time is within the DST period
     * @param {number} month - Month (1-12)
     * @param {number} day - Day of month
     * @param {string} timeStr - Time string in HH:MM format
     * @param {object} dstInfo - DST info from findDSTTransitions
     * @param {number} year - Year
     * @returns {boolean} True if date/time is in DST period
     */
    isInDSTPeriod(month, day, timeStr, dstInfo, year) {
        if (!dstInfo.hasDST || !dstInfo.start || !dstInfo.end) {
            return false;
        }

        // Parse the time to get hours
        let hour = 12; // Default to noon if no time provided
        if (timeStr) {
            const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
            if (match) {
                hour = parseInt(match[1], 10);
            }
        }

        const checkDate = new Date(year, month - 1, day, hour, 0, 0);
        const dstStart = dstInfo.start;
        const dstEnd = dstInfo.end;

        // Handle both Northern and Southern hemisphere cases
        if (dstStart < dstEnd) {
            // Northern hemisphere: DST is between start and end in same year
            return checkDate >= dstStart && checkDate < dstEnd;
        } else {
            // Southern hemisphere: DST spans year boundary
            return checkDate >= dstStart || checkDate < dstEnd;
        }
    },

    /**
     * Convert a time from DST to Standard Time
     * @param {string} timeStr - Time string in HH:MM format
     * @param {number} offsetMinutes - DST offset in minutes to subtract
     * @returns {string} Converted time string
     */
    convertDSTToStandard(timeStr, offsetMinutes) {
        if (!timeStr || typeof timeStr !== 'string') {
            return timeStr;
        }

        const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})$/);
        if (!match) {
            return timeStr;
        }

        let hours = parseInt(match[1], 10);
        let minutes = parseInt(match[2], 10);

        // Subtract the DST offset (typically 60 minutes)
        let totalMinutes = hours * 60 + minutes - offsetMinutes;
        
        // Handle day wraparound
        if (totalMinutes < 0) {
            totalMinutes += 24 * 60;
        } else if (totalMinutes >= 24 * 60) {
            totalMinutes -= 24 * 60;
        }

        hours = Math.floor(totalMinutes / 60);
        minutes = totalMinutes % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    },

    /**
     * Format a date for display with time
     * @param {Date|null} date - Date to format
     * @returns {string} Formatted date string with time
     */
    formatDate(date) {
        if (!date) return '--';
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const dayName = days[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${dayName}, ${day} ${month} ${year} at ${hours}:${minutes}`;
    },

    /**
     * Format offset for display
     * @param {number} offsetMinutes - Offset in minutes
     * @returns {string} Formatted offset string (e.g., "+1 hour")
     */
    formatOffset(offsetMinutes) {
        if (offsetMinutes === 0) return 'None';
        
        const hours = Math.floor(offsetMinutes / 60);
        const minutes = offsetMinutes % 60;
        
        let result = '';
        if (hours > 0) {
            result += `${hours} hour${hours !== 1 ? 's' : ''}`;
        }
        if (minutes > 0) {
            result += `${hours > 0 ? ' ' : ''}${minutes} min`;
        }
        
        return `+${result}`;
    }
};
