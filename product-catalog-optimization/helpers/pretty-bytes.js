const { isNumber } = require('lodash');

class Unit {
  constructor(symbol, value) {
    this.symbol = symbol;
    this.value = value;
  }
}

const UNITS_ORDERED_DESC = [
  new Unit('PB', 1024 * 1024 * 1024 * 1024 * 1024),
  new Unit('TB', 1024 * 1024 * 1024 * 1024),
  new Unit('GB', 1024 * 1024 * 1024),
  new Unit('MB', 1024 * 1024),
  new Unit('KB', 1024),
  new Unit('B', 1),
];

/**
 *
 * @param {Number} x: the value to round
 * @returns x rounded to 2 decimal places
 */
function round(x) {
  return Math.round(x * 100) / 100;
}

function prettyBytes(bytes) {
  if (!isNumber(bytes)) {
    throw new TypeError('prettyBytes function only supports numeric input');
  }
  const rounded = round(bytes);
  if (Math.abs(rounded) < Number.EPSILON) {
    return '0B';
  }

  for (const unit of UNITS_ORDERED_DESC) {
    const quotient = bytes / unit.value;
    if (Math.abs(quotient) >= 1) {
      return `${round(quotient)}${unit.symbol}`;
    }
  }
  return `${bytes}B`;
}

module.exports = {
  prettyBytes,
};
