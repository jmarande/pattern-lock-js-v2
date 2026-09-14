import { PatternLock } from '../src/pattern-lock.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const ARROW_MARKER_ID = 'forensic-direction-arrow';

const svg = document.querySelector('#lock');
const input = document.querySelector('#pattern-input');
const oneBased = document.querySelector('#one-based');
const coords = document.querySelector('#coords');
const copyButton = document.querySelector('#copy');

const lock = new PatternLock(svg, {
  onPattern(result) {
    renderOutputs(result);
  },
});

function snapshot() {
  return {
    oneBased: lock.getPattern('oneBasedArray'),
    oneBasedString: lock.getPattern('oneBasedString'),
    coordinates: lock.getPattern('coordinates'),
  };
}

function renderOutputs(result = snapshot()) {
  oneBased.textContent = result.oneBased?.join('-') || '—';
  coords.textContent = result.coordinates?.map(({ row, col }) => `(${row},${col})`).join(' → ') || '—';
  applyDirectionArrows();
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

function ensureArrowMarker() {
  let defs = svg.querySelector('defs[data-forensic-defs="true"]');
  if (!defs) {
    defs = document.createElementNS(SVG_NS, 'defs');
    defs.dataset.forensicDefs = 'true';
    svg.prepend(defs);
  }

  let marker = defs.querySelector(`#${ARROW_MARKER_ID}`);
  if (marker) return;

  marker = document.createElementNS(SVG_NS, 'marker');
  marker.setAttribute('id', ARROW_MARKER_ID);
  marker.setAttribute('markerWidth', '8');
  marker.setAttribute('markerHeight', '8');
  marker.setAttribute('refX', '7');
  marker.setAttribute('refY', '4');
  marker.setAttribute('orient', 'auto');
  marker.setAttribute('markerUnits', 'userSpaceOnUse');

  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M0,0 L8,4 L0,8 Z');
  path.setAttribute('fill', '#111827');

  marker.append(path);
  defs.append(marker);
}

function applyDirectionArrows() {
  ensureArrowMarker();
  const lines = svg.querySelectorAll('.lock-lines line:not(.lock-preview)');
  lines.forEach((line) => {
    line.setAttribute('marker-end', `url(#${ARROW_MARKER_ID})`);
  });
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildShareSvgMarkup() {
  applyDirectionArrows();
  const clone = svg.cloneNode(true);
  clone.setAttribute('xmlns', SVG_NS);
  clone.setAttribute('width', '620');
  clone.setAttribute('height', '620');
  clone.setAttribute('viewBox', '0 0 100 100');

  const androidFormat = lock.getPattern('oneBasedString') || '—';

  return `
    <svg xmlns="${SVG_NS}" width="900" height="860" viewBox="0 0 900 860">
      <style>
        .share-bg{fill:#ffffff}
        .share-card{fill:#ffffff;stroke:#e5e7eb;stroke-width:2}
        .share-label{fill:#6b7280;font-family:Inter,Arial,sans-serif;font-size:28px;font-weight:700}
        .share-value{fill:#111827;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:40px;font-weight:700}
        .patternlock .lock-lines line{stroke:#111827;stroke-width:2.2;stroke-linecap:round;opacity:.55}
        .patternlock .lock-lines .lock-preview{opacity:.35}
        .patternlock .lock-dots circle{fill:#111827;stroke:transparent;stroke-width:14}
        .patternlock .lock-actives circle{fill:#2563eb;opacity:.24}
      </style>
      <rect class="share-bg" x="0" y="0" width="900" height="860" rx="28" />
      <rect class="share-card" x="30" y="30" width="840" height="800" rx="26" />
      <g transform="translate(140 70)">
        ${new XMLSerializer().serializeToString(clone)}
      </g>
      <text class="share-label" x="450" y="735" text-anchor="middle">Format Android</text>
      <text class="share-value" x="450" y="785" text-anchor="middle">${xmlEscape(androidFormat)}</text>
    </svg>
  `.trim();
}

function svgMarkupToPngBlob(markup) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1800;
      canvas.height = 1720;
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((pngBlob) => {
        URL.revokeObjectURL(url);
        if (!pngBlob) {
          reject(new Error('Impossible de générer l’image PNG.'));
          return;
        }
        resolve(pngBlob);
      }, 'image/png');
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Impossible de charger l’image SVG.'));
    };

    image.src = url;
  });
}

async function copyImageToClipboard() {
  const markup = buildShareSvgMarkup();
  const pngBlob = await svgMarkupToPngBlob(markup);

  if (!window.ClipboardItem || !navigator.clipboard?.write) {
    throw new Error('La copie d’image n’est pas prise en charge sur ce navigateur.');
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': pngBlob,
    }),
  ]);
}

document.querySelector('#apply').addEventListener('click', applyInput);
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') applyInput();
});

document.querySelector('#clear').addEventListener('click', () => {
  lock.clear();
  renderOutputs();
});

copyButton.addEventListener('click', async () => {
  const originalLabel = copyButton.textContent;
  copyButton.disabled = true;

  try {
    await copyImageToClipboard();
    copyButton.textContent = 'Image copiée';
  } catch (error) {
    console.error(error);
    copyButton.textContent = 'Copie impossible';
  } finally {
    window.setTimeout(() => {
      copyButton.textContent = originalLabel;
      copyButton.disabled = false;
    }, 1600);
  }
});

document.querySelector('#export-svg').addEventListener('click', async () => {
  const markup = buildShareSvgMarkup();
  const blob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pattern-${lock.getPattern('compactOneBased') || 'empty'}.svg`;
  a.click();
  URL.revokeObjectURL(url);
});

applyInput();
