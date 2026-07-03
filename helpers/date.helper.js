/**
 * Format a Date object or timestamp string into Thai locale format
 * @param {Date|string} dateVal - Date input
 * @param {boolean} includeTime - Whether to include hours and minutes
 * @returns {string} Formatted date string
 */
const formatThaiDate = (dateVal, includeTime = true) => {
  if (!dateVal) return '-';
  const dateObj = new Date(dateVal);
  if (isNaN(dateObj.getTime())) return '-';
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.second = '2-digit';
    options.hour12 = false;
  }
  
  return dateObj.toLocaleDateString('th-TH', options);
};

module.exports = {
  formatThaiDate
};
