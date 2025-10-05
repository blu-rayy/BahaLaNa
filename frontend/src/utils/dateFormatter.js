/**
 * Date Formatting Utilities
 */
import { format, parse, isValid, subDays, addDays } from 'date-fns';

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date - Date object or string
 * @returns {string} Formatted date string
 */
export const formatToYYYYMMDD = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};

/**
 * Format date to readable format (e.g., "Oct 5, 2025")
 * @param {Date|string} date - Date object or string
 * @returns {string} Formatted date string
 */
export const formatToReadable = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d, yyyy');
};

/**
 * Format date to YYYYMMDD (for POWER API)
 * @param {Date|string} date - Date object or string
 * @returns {string} Formatted date string
 */
export const formatToYYYYMMDDCompact = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyyMMdd');
};

/**
 * Parse date string
 * @param {string} dateString - Date string
 * @param {string} formatString - Format pattern (default: 'yyyy-MM-dd')
 * @returns {Date} Date object
 */
export const parseDate = (dateString, formatString = 'yyyy-MM-dd') => {
  return parse(dateString, formatString, new Date());
};

/**
 * Check if date is valid
 * @param {Date|string} date - Date to check
 * @returns {boolean} Whether date is valid
 */
export const isValidDate = (date) => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isValid(dateObj);
};

/**
 * Get date range for last N days
 * @param {number} days - Number of days (default: 7)
 * @returns {Object} {start_date, end_date} in YYYY-MM-DD format
 */
export const getLastNDays = (days = 7) => {
  const end = new Date();
  const start = subDays(end, days - 1);
  return {
    start_date: formatToYYYYMMDD(start),
    end_date: formatToYYYYMMDD(end),
  };
};

/**
 * Get date range for current month
 * @returns {Object} {start_date, end_date} in YYYY-MM-DD format
 */
export const getCurrentMonth = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    start_date: formatToYYYYMMDD(start),
    end_date: formatToYYYYMMDD(now),
  };
};

/**
 * Calculate date difference in days
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Difference in days
 */
export const dateDiffInDays = (date1, date2) => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
