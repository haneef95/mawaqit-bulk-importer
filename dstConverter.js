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
     * Find DST transitions for a given year and timezone
     * @param {string} timezone - IANA timezone string (e.g., "Europe/London")
     * @param {number} year - Year to check for DST transitions
     * @returns {{start: Date|null, end: Date|null, offset: number}} DST period info
     */
    findDSTTransitions(timezone, year) {
        const result = {
            start: null,
            end: null,
            offset: 0, // DST offset in minutes
            hasDST: false
        };

        try {
            // Check each day of the year for offset changes
            const offsets = [];
            const jan1 = new Date(year, 0, 1);
            const jul1 = new Date(year, 6, 1);
            
            const janOffset = this.getTimezoneOffset(jan1, timezone);
            const julOffset = this.getTimezoneOffset(jul1, timezone);
            
            // If offsets are the same, no DST
            if (janOffset === julOffset) {
                return result;
            }

            result.hasDST = true;
            
            // Determine which is standard and which is DST
            // In Northern Hemisphere, summer (July) typically has DST (smaller offset)
            // In Southern Hemisphere, it's reversed
            const standardOffset = Math.max(janOffset, julOffset);
            const dstOffset = Math.min(janOffset, julOffset);
            result.offset = standardOffset - dstOffset; // DST offset in minutes

            // Find the exact transition dates
            let prevOffset = janOffset;
            let dstStart = null;
            let dstEnd = null;

            // Check each day to find transitions
            for (let month = 0; month < 12; month++) {
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, month, day);
                    const currentOffset = this.getTimezoneOffset(date, timezone);
                    
                    if (currentOffset !== prevOffset) {
                        // Found a transition - find the exact time
                        const transitionDate = this.findExactTransition(year, month, day, timezone, prevOffset);
                        
                        if (currentOffset === dstOffset) {
                            // Transitioning TO DST (clocks spring forward)
                            dstStart = transitionDate;
                        } else {
                            // Transitioning FROM DST (clocks fall back)
                            dstEnd = transitionDate;
                        }
                        prevOffset = currentOffset;
                    }
                }
            }

            result.start = dstStart;
            result.end = dstEnd;

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
     * @param {number} prevOffset - Previous day's offset
     * @returns {Date} Exact transition datetime
     */
    findExactTransition(year, month, day, timezone, prevOffset) {
        // Check each hour of the day
        for (let hour = 0; hour < 24; hour++) {
            const date = new Date(year, month, day, hour);
            const currentOffset = this.getTimezoneOffset(date, timezone);
            if (currentOffset !== prevOffset) {
                return date;
            }
        }
        return new Date(year, month, day);
    },

    /**
     * Get timezone offset in minutes for a given date and timezone
     * @param {Date} date - Date to check
     * @param {string} timezone - IANA timezone string
     * @returns {number} Offset in minutes from UTC
     */
    getTimezoneOffset(date, timezone) {
        try {
            const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
            return (utcDate - tzDate) / 60000; // Convert ms to minutes
        } catch (error) {
            console.error('Error getting timezone offset:', error);
            return 0;
        }
    },

    /**
     * Check if a given date is within the DST period
     * @param {number} month - Month (1-12)
     * @param {number} day - Day of month
     * @param {object} dstInfo - DST info from findDSTTransitions
     * @param {number} year - Year
     * @returns {boolean} True if date is in DST period
     */
    isInDSTPeriod(month, day, dstInfo, year) {
        if (!dstInfo.hasDST || !dstInfo.start || !dstInfo.end) {
            return false;
        }

        const date = new Date(year, month - 1, day, 12); // Use noon to avoid edge cases
        const dstStart = dstInfo.start;
        const dstEnd = dstInfo.end;

        // Handle both Northern and Southern hemisphere cases
        if (dstStart < dstEnd) {
            // Northern hemisphere: DST is between start and end in same year
            return date >= dstStart && date < dstEnd;
        } else {
            // Southern hemisphere: DST spans year boundary
            return date >= dstStart || date < dstEnd;
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
     * Format a date for display
     * @param {Date|null} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        if (!date) return '--';
        
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        
        return date.toLocaleDateString('en-GB', options);
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
