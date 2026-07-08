/**
 * Simple CSV parser to parse raw CSV content
 * @param {string} csvText - Raw CSV text content
 * @returns {Array<Array<string>>} 2D array of values
 */
function parseCSV(csvText) {
  // Strip UTF-8 BOM if present
  if (csvText.startsWith('\ufeff')) {
    csvText = csvText.substring(1);
  }

  const lines = [];
  let row = [""];
  lines.push(row);
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];
    const next = csvText[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++; // skip Windows CRLF linefeed
      }
      row = [''];
      lines.push(row);
    } else {
      row[row.length - 1] += c;
    }
  }

  // Filter out completely empty lines at the end
  return lines.filter(r => r.length > 1 || (r.length === 1 && r[0] !== ''));
}

/**
 * Generate CSV download content from database records
 * @param {Array<Object>} data - Array of database row objects
 * @param {Array<string>} headers - Header column keys
 * @returns {string} CSV string content
 */
function generateCSV(data, headers) {
  const headerRow = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',');
  const rows = data.map(item => {
    return headers.map(h => {
      const val = item[h] !== undefined && item[h] !== null ? String(item[h]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',');
  });
  return '\ufeff' + [headerRow, ...rows].join('\r\n');
}

module.exports = {
  parseCSV,
  generateCSV
};
