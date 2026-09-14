import { PatternEngine } from './pattern-engine.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export class PatternLock {
  static defaults = Object.freeze({
    size: 3,
    vibrate: true,
    readOnly: false,
    hitRadius: 10,
    onPattern: () => undefined,
  });

  constructor(element, options = {}) {
    if (!(element instanceof SVGElement)) {
      throw new TypeError('PatternLock requires an SVG element');
    }

    this.svg = element;
    this.options = { ...PatternLock.defaults, ...options };
    this.engine = new PatternEngine({ size: this.options.size });
    this.pointerId = null;
    this.dragging = false;
    this.previewLine = null;

    this.#build();
    this.#bind();
  }

  clear() {
    this.engine.clear();
    this.svg.classList.remove('success', 'error', 'readonly-pattern');
    this.lines.replaceChildren();
    this.actives.replaceChildren();
    this.previewLine = null;
  }

  success() {
    this.svg.classList.remove('error');
    this.svg.classList.add('success');
  }

  error() {
    this.svg.classList.remove('success');
    this.svg.classList.add('error');
  }

  getPattern(format = 'oneBasedArray') {
    return this.engine.getPattern(format);
  }

  setPattern(pattern, {
    inputBase = 'auto',
    applyAndroidRules = true,
    readOnly = this.options.readOnly,
  } = {}) {
    this.clear();
    this.engine.setPattern(pattern, { inputBase, applyAndroidRules });
    this.#renderCompletedPattern();
    this.svg.classList.toggle('readonly-pattern', Boolean(readOnly));
    return this.getPattern('oneBasedArray');
  }

  setReadOnly(value) {
    this.options.readOnly = Boolean(value);
    this.svg.classList.toggle('readonly-pattern', this.options.readOnly);
  }

  destroy() {
    this.svg.removeEventListener('pointerdown', this.onPointerDown);
    this.svg.removeEventListener('pointermove', this.onPointerMove);
    this.svg.removeEventListener('pointerup', this.onPointerUp);
    this.svg.removeEventListener('pointercancel', this.onPointerUp);
    this.clear();
  }

  #build() {
    this.svg.classList.add('patternlock');
    this.svg.setAttribute('viewBox', '0 0 100 100');
    this.svg.setAttribute('role', 'application');
    this.svg.setAttribute('aria-label', 'Android-style pattern grid');

    this.lines = this.#ensureGroup('lock-lines');
    this.actives = this.#ensureGroup('lock-actives');
    this.dots = this.#ensureGroup('lock-dots');

    this.dots.replaceChildren();
    const positions = this.#gridPositions();
    positions.forEach(({ x, y }, index) => {
      const dot = document.createElementNS(SVG_NS, 'circle');
      dot.setAttribute('cx', x);
      dot.setAttribute('cy', y);
      dot.setAttribute('r', '2.4');
      dot.dataset.index = String(index);
      this.dots.append(dot);
    });
  }

  #ensureGroup(className) {
    let group = this.svg.querySelector(`g.${className}`);
    if (!group) {
      group = document.createElementNS(SVG_NS, 'g');
      group.classList.add(className);
      this.svg.append(group);
    }
    return group;
  }

  #gridPositions() {
    const size = this.options.size;
    const min = 20;
    const max = 80;
    const step = size === 1 ? 0 : (max - min) / (size - 1);
    const points = [];
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        points.push({ x: min + col * step, y: min + row * step });
      }
    }
    return points;
  }

  #bind() {
    this.onPointerDown = (event) => {
      if (this.options.readOnly || event.button > 0) return;
      const pos = this.#svgPosition(event);
      const index = this.#hitTest(pos);
      if (index === null) return;

      this.clear();
      this.dragging = true;
      this.pointerId = event.pointerId;
      this.svg.setPointerCapture?.(event.pointerId);
      this.#appendIndex(index);
      this.#createPreviewLine(pos);
      event.preventDefault();
    };

    this.onPointerMove = (event) => {
      if (!this.dragging || event.pointerId !== this.pointerId) return;
      const pos = this.#svgPosition(event);
      const index = this.#hitTest(pos);
      if (index !== null) this.#appendIndex(index);
      this.#updatePreviewLine(pos);
      event.preventDefault();
    };

    this.onPointerUp = (event) => {
      if (!this.dragging || event.pointerId !== this.pointerId) return;
      this.dragging = false;
      this.svg.releasePointerCapture?.(event.pointerId);
      this.pointerId = null;
      this.#removePreviewLine();

      const result = {
        oneBased: this.getPattern('oneBasedArray'),
        zeroBased: this.getPattern('zeroBasedArray'),
        oneBasedString: this.getPattern('oneBasedString'),
        zeroBasedString: this.getPattern('zeroBasedString'),
        coordinates: this.getPattern('coordinates'),
      };
      const verdict = this.options.onPattern.call(this, result);
      if (verdict === true) this.success();
      if (verdict === false) this.error();
      event.preventDefault();
    };

    this.svg.addEventListener('pointerdown', this.onPointerDown);
    this.svg.addEventListener('pointermove', this.onPointerMove);
    this.svg.addEventListener('pointerup', this.onPointerUp);
    this.svg.addEventListener('pointercancel', this.onPointerUp);
  }

  #appendIndex(index) {
    const appended = this.engine.append(index);
    if (appended.length === 0) return;

    for (const addedIndex of appended) {
      const all = this.engine.getPattern('zeroBasedArray');
      const positionInPattern = all.indexOf(addedIndex);
      const previousIndex = positionInPattern > 0 ? all[positionInPattern - 1] : null;

      if (previousIndex !== null) {
        this.lines.append(this.#lineBetween(previousIndex, addedIndex));
      }
      this.actives.append(this.#activeMarker(addedIndex));
      this.#vibrate();
    }
  }

  #renderCompletedPattern() {
    const pattern = this.engine.getPattern('zeroBasedArray');
    pattern.forEach((index, position) => {
      if (position > 0) {
        this.lines.append(this.#lineBetween(pattern[position - 1], index));
      }
      this.actives.append(this.#activeMarker(index));
    });
  }

  #activeMarker(index) {
    const { x, y } = this.#pointFor(index);
    const marker = document.createElementNS(SVG_NS, 'circle');
    marker.setAttribute('cx', x);
    marker.setAttribute('cy', y);
    marker.setAttribute('r', '6');
    marker.dataset.index = String(index);
    return marker;
  }

  #lineBetween(from, to) {
    const a = this.#pointFor(from);
    const b = this.#pointFor(to);
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', a.x);
    line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x);
    line.setAttribute('y2', b.y);
    return line;
  }

  #createPreviewLine(pos) {
    const last = this.engine.getPattern('zeroBasedArray').at(-1);
    if (last === undefined) return;
    const p = this.#pointFor(last);
    const line = document.createElementNS(SVG_NS, 'line');
    line.classList.add('lock-preview');
    line.setAttribute('x1', p.x);
    line.setAttribute('y1', p.y);
    line.setAttribute('x2', pos.x);
    line.setAttribute('y2', pos.y);
    this.lines.append(line);
    this.previewLine = line;
  }

  #updatePreviewLine(pos) {
    if (!this.previewLine) return;
    const last = this.engine.getPattern('zeroBasedArray').at(-1);
    if (last !== undefined) {
      const p = this.#pointFor(last);
      this.previewLine.setAttribute('x1', p.x);
      this.previewLine.setAttribute('y1', p.y);
    }
    this.previewLine.setAttribute('x2', pos.x);
    this.previewLine.setAttribute('y2', pos.y);
  }

  #removePreviewLine() {
    this.previewLine?.remove();
    this.previewLine = null;
  }

  #pointFor(index) {
    return this.#gridPositions()[index];
  }

  #hitTest(pos) {
    const points = this.#gridPositions();
    let winner = null;
    let bestDistance = Infinity;
    points.forEach((point, index) => {
      const distance = Math.hypot(pos.x - point.x, pos.y - point.y);
      if (distance <= this.options.hitRadius && distance < bestDistance) {
        winner = index;
        bestDistance = distance;
      }
    });
    return winner;
  }

  #svgPosition(event) {
    const point = this.svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(this.svg.getScreenCTM().inverse());
  }

  #vibrate() {
    if (!this.options.vibrate) return;
    navigator.vibrate?.(20);
  }
}
