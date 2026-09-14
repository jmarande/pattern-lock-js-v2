import { PatternLock } from '../src/pattern-lock.js';

const svg = document.querySelector('#lock');
const input = document.querySelector('#pattern-input');
const oneBased = document.querySelector('#one-based');
const zeroBased = document.querySelector('#zero-based');
const compact = document.querySelector('#compact');
const coords = document.querySelector('#coords');

const lock = new PatternLock(svg, {
  onPattern(result) {
    renderOutputs(result);
  },
});

function snapshot() {
  return {
    oneBased: lock.getPattern('oneBasedArray'),
    zeroBased: lock.getPattern('zeroBasedArray'),
    oneBasedString: lock.getPattern('oneBasedString'),
    zeroBasedString: lock.getPattern('zeroBasedString'),
    compact: lock.getPattern('compactOneBased'),
    coordinates: lock.getPattern('coordinates'),
  };
}

function renderOutputs(result = snapshot()) {
  oneBased.textContent = result.oneBased?.join('-') || '—';
  zeroBased.textContent = result.zeroBased?.join('-') || '—';
  compact.textContent = result.compact ?? result.oneBased?.join('') ?? '—';
  coords.textContent = result.coordinates?.map(({ row, col }) => `(${row},${col})`).join(' → ') || '—';
}

function applyInput() {
  try {
    lock.setPattern(input.value, { inputBase: 'auto' });
    renderOutputs();
    input.setCustomValidity('');
  } catch (error) {
    input.setCustomValidity(error.message);
    input.reportValidity();
  }
}

document.querySelector('#apply').addEventListener('click', applyInput);
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') applyInput();
});

document.querySelector('#clear').addEventListener('click', () => {
  lock.clear();
  renderOutputs();
});

document.querySelector('#copy').addEventListener('click', async () => {
  const data = snapshot();
  const text = [
    `Android 1-9: ${data.oneBasedString}`,
    `Index 0-8: ${data.zeroBasedString}`,
    `Compact: ${data.compact}`,
    `Coordinates: ${data.coordinates.map(({ row, col }) => `(${row},${col})`).join(' -> ')}`,
  ].join('\n');
  await navigator.clipboard.writeText(text);
});

document.querySelector('#export-svg').addEventListener('click', () => {
  const clone = svg.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = `
    .lock-lines line{stroke:#111827;stroke-width:2.2;stroke-linecap:round;opacity:.55}
    .lock-dots circle{fill:#111827}
    .lock-actives circle{fill:#2563eb;opacity:.24}
  `;
  clone.prepend(style);
  const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pattern-${lock.getPattern('compactOneBased') || 'empty'}.svg`;
  a.click();
  URL.revokeObjectURL(url);
});

applyInput();
