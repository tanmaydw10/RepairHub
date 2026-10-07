/**
 * RepairHub Currency & Numeric Formatters (Indian Rupee - INR)
 */

/**
 * Format a numeric amount into Indian Rupee string (e.g., ₹12,499.00 or ₹8,500)
 * @param {number|string} amount
 * @param {object} options { showDecimals: boolean, fallback: string }
 * @returns {string}
 */
export function formatINR(amount, options = {}) {
  const { showDecimals = false, fallback = 'Pending Quote' } = options;

  if (amount === null || amount === undefined || amount === '' || isNaN(Number(amount))) {
    return fallback;
  }

  const num = typeof amount === 'number' ? amount : parseFloat(amount);

  const formatted = num.toLocaleString('en-IN', {
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0
  });

  return `₹${formatted}`;
}

/**
 * Format an INR range (e.g., ₹1,800 - ₹4,500)
 * @param {number|string} min
 * @param {number|string} max
 * @returns {string}
 */
export function formatINRRange(min, max) {
  return `${formatINR(min)} - ${formatINR(max)}`;
}
