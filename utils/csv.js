const escapeCell = (value) => {
  const safeValue = `${value ?? ''}`.replace(/"/g, '""');
  return `"${safeValue}"`;
};

const rowsToCsv = (rows = []) => rows.map((row) => row.map(escapeCell).join(',')).join('\n');

module.exports = {
  rowsToCsv
};
