import test from 'node:test';
import assert from 'node:assert/strict';
import { PatternEngine, parsePattern } from '../src/pattern-engine.js';

test('parses one-based and zero-based patterns', () => {
  assert.deepEqual(parsePattern('1-2-5-8'), [0, 1, 4, 7]);
  assert.deepEqual(parsePattern('0,1,4,7'), [0, 1, 4, 7]);
  assert.deepEqual(parsePattern('1258'), [0, 1, 4, 7]);
});

test('adds Android midpoint horizontally', () => {
  const engine = new PatternEngine();
  engine.append(0);
  engine.append(2);
  assert.deepEqual(engine.getPattern('oneBasedArray'), [1, 2, 3]);
});

test('adds Android midpoint vertically', () => {
  const engine = new PatternEngine();
  engine.append(0);
  engine.append(6);
  assert.deepEqual(engine.getPattern('oneBasedArray'), [1, 4, 7]);
});

test('adds Android midpoint diagonally', () => {
  const engine = new PatternEngine();
  engine.append(0);
  engine.append(8);
  assert.deepEqual(engine.getPattern('oneBasedArray'), [1, 5, 9]);
});

test('does not reinsert a midpoint already used', () => {
  const engine = new PatternEngine();
  engine.setPattern([1, 5, 9], { inputBase: 'one' });
  assert.deepEqual(engine.getPattern('oneBasedArray'), [1, 5, 9]);
});

test('ignores an already-used destination', () => {
  const engine = new PatternEngine();
  engine.append(0);
  engine.append(1);
  assert.deepEqual(engine.append(0), []);
  assert.deepEqual(engine.getPattern('oneBasedArray'), [1, 2]);
});

test('exports all supported representations', () => {
  const engine = new PatternEngine();
  engine.setPattern('1-2-5-8');
  assert.deepEqual(engine.getPattern('zeroBasedArray'), [0, 1, 4, 7]);
  assert.equal(engine.getPattern('oneBasedString'), '1-2-5-8');
  assert.equal(engine.getPattern('zeroBasedString'), '0-1-4-7');
  assert.equal(engine.getPattern('compactOneBased'), '1258');
  assert.deepEqual(engine.getPattern('coordinates'), [
    { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 },
  ]);
});

test('supports explicit raw rendering without Android insertion', () => {
  const engine = new PatternEngine();
  engine.setPattern('1-3', { applyAndroidRules: false });
  assert.deepEqual(engine.getPattern('oneBasedArray'), [1, 3]);
});
