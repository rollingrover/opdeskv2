import Papa from 'papaparse'

/**
 * Exports an array of objects to a downloaded CSV file.
 *
 * @param {Array<object>} rows - the data to export
 * @param {Array<{key: string, label: string, format?: (row: object) => any}>} columns -
 *   column definitions; `format` lets a column derive its value from the
 *   whole row (e.g. resolving a foreign key to a name) rather than a flat
 *   property lookup. Values are exported as plain numbers/strings, not
 *   currency-formatted text — that's a deliberate choice, since a string
 *   like "R 1,234" is treated as text by Excel/Sheets and breaks any SUM()
 *   or further calculation the person doing this export almost certainly
 *   wants to do.
 * @param {string} filename - without extension; ".csv" is appended
 */
export function exportToCSV(rows, columns, filename) {
  const data = (rows || []).map(row =>
    Object.fromEntries(columns.map(col => [col.label, col.format ? col.format(row) : (row[col.key] ?? '')]))
  )
  const csv = Papa.unparse(data)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }) // BOM so Excel opens accented/non-Latin characters correctly
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `${filename}-${stamp}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
