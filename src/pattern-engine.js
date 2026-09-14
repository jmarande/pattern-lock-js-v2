/**
 * Pure pattern engine for Android-style grid patterns.
 * The engine is DOM-free and independently testable.
 */
export class PatternEngine {
  constructor({ size = 3 } = {}) {
    if (!Number.isInteger(size) || size < 2) {
      throw new TypeError('size must be an integer >= 2');
    }
    this.size = size;
    this.clear();
  }

  clear() {
    this.points = [];
    this.used = new Set();
  }

  append(index) {
    this.#assertIndex(index);
    if (this.used.has(index)) return [];

    const appended = [];
    const previous = this.points.at(-1);

    if (previous !== undefined) {
      const midpoint = this.intermediatePoint(previous, index);
      if (midpoint !== null && !this.used.has(midpoint)) {
        this.#push(midpoint);
        appended.push(midpoint);
      }
    }

    this.#push(index);
    appended.push(index);
    return appended;
  }

  intermediatePoint(from, to) {
    this.#assertIndex(from);
    this.#assertIndex(to);

    const a = this.indexToCoord(from);
    const b = this.indexToCoord(to);
    const rowSum = a.row + b.row;
    const colSum = a.col + b.col;

    // A skipped point exists only when the midpoint lands exactly on the grid.
    if (rowSum % 2 !== 0 || colSum % 2 !== 0) return null;

    const row = rowSum / 2;
    const col = colSum / 2;
    const midpoint = this.coordToIndex(row, col);

    return midpoint === from || midpoint === to ? null : midpoint;
  }

  setPattern(pattern, { inputBase = 'auto', applyAndroidRules = true } = {}) {
    const indexes = parsePattern(pattern, { size: this.size, inputBase });
    this.clear();

    if (applyAndroidRules) {
      for (const index of indexes) this.append(index);
    } else {
      for (const index of indexes) {
        this.#assertIndex(index);
        if (!this.used.has(index)) this.#push(index);
      }
    }
    return this.getPattern('zeroBasedArray');
  }

  getPattern(format = 'oneBasedArray') {
    const zero = [...this.points];
    const one = zero.map((n) => n + 1);

    switch (format) {
      case 'zeroBasedArray': return zero;
      case 'oneBasedArray': return one;
      case 'zeroBasedString': return zero.join('-');
      case 'oneBasedString': return one.join('-');
      case 'compactOneBased': return one.join('');
      case 'coordinates': return zero.map((index) => this.indexToCoord(index));
      default:
        throw new TypeError(`Unknown pattern format: ${format}`);
    }
  }

  indexToCoord(index) {
    this.#assertIndex(index);
    return {
      row: Math.floor(index / this.size),
      col: index % this.size,
    };
  }

  coordToIndex(row, col) {
    if (![row, col].every(Number.isInteger)) {
      throw new TypeError('row and col must be integers');
    }
    if (row < 0 || col < 0 || row >= this.size || col >= this.size) {
      throw new RangeError('coordinate outside grid');
    }
    return row * this.size + col;
  }

  #push(index) {
    this.points.push(index);
    this.used.add(index);
  }

  #assertIndex(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this.size ** 2) {
      throw new RangeError(`index must be between 0 and ${this.size ** 2 - 1}`);
    }
  }
}

/**
 * Parse array/string input to zero-based indexes.
 * Accepted examples for a 3x3 grid:
 *   [1,2,5,8] with inputBase='one'
 *   [0,1,4,7] with inputBase='zero'
 *   '1-2-5-8', '1,2,5,8', '1258'
 */
export function parsePattern(pattern, { size = 3, inputBase = 'auto' } = {}) {
  const max = size ** 2;
  let values;

  if (Array.isArray(pattern)) {
    values = pattern.map(Number);
  } else if (typeof pattern === 'string') {
    const trimmed = pattern.trim();
    if (!trimmed) return [];

    if (/^\d+$/.test(trimmed) && max <= 9) {
      values = [...trimmed].map(Number);
    } else {
      values = trimmed.split(/[\s,;:\-→>]+/).filter(Boolean).map(Number);
    }
  } else if (typeof pattern === 'number' && Number.isFinite(pattern)) {
    values = String(Math.trunc(pattern)).split('').map(Number);
  } else {
    throw new TypeError('pattern must be an array, string, or number');
  }

  if (!values.every(Number.isInteger)) {
    throw new TypeError('pattern contains a non-integer value');
  }

  let base = inputBase;
  if (base === 'auto') {
    base = values.includes(0) ? 'zero' : 'one';
  }
  if (base !== 'zero' && base !== 'one') {
    throw new TypeError("inputBase must be 'auto', 'zero', or 'one'");
  }

  const indexes = base === 'one' ? values.map((n) => n - 1) : values;
  for (const index of indexes) {
    if (index < 0 || index >= max) {
      throw new RangeError(`pattern value outside ${base}-based ${size}x${size} grid`);
    }
  }
  return indexes;
}
