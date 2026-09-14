# Pattern Lock JS v2

Modern, dependency-free rewrite inspired by [`tympanix/pattern-lock-js`](https://github.com/tympanix/pattern-lock-js).

The project keeps the lightweight SVG idea but replaces the 2017 jQuery/Gulp implementation with native JavaScript, Pointer Events and a DOM-free pattern engine.

## Goals

- Native JavaScript: no runtime dependency.
- Mouse, touch and stylus through Pointer Events.
- Android-style intermediate-point insertion.
- Explicit one-based (1–9) and zero-based (0–8) representations.
- Programmatic pattern rendering / read-only visualization.
- SVG export-friendly rendering.
- Offline operation.
- Unit-tested pattern engine.

## Run locally

```bash
npm test
npm run serve
```

Then open `http://localhost:8080/demo/`.

## Usage

```html
<link rel="stylesheet" href="./src/pattern-lock.css">
<svg id="lock"></svg>
<script type="module">
  import { PatternLock } from './src/pattern-lock.js';

  const lock = new PatternLock(document.querySelector('#lock'), {
    onPattern(result) {
      console.log(result.oneBased);      // [1, 2, 5, 8]
      console.log(result.zeroBased);     // [0, 1, 4, 7]
    }
  });
</script>
```

## Render an existing pattern

```js
lock.setPattern('1-2-5-8');
lock.setPattern([0, 1, 4, 7], { inputBase: 'zero' });
```

The Android skip rule is applied by default. Example: `1-3` becomes `1-2-3`. To render a literal/raw sequence instead:

```js
lock.setPattern('1-3', { applyAndroidRules: false });
```

## Pattern formats

```js
lock.getPattern('oneBasedArray');   // [1, 2, 5, 8]
lock.getPattern('zeroBasedArray');  // [0, 1, 4, 7]
lock.getPattern('oneBasedString');  // "1-2-5-8"
lock.getPattern('zeroBasedString'); // "0-1-4-7"
lock.getPattern('compactOneBased'); // "1258"
lock.getPattern('coordinates');     // [{row:0,col:0}, ...]
```

## Project structure

- `src/pattern-engine.js` — pure grid/pattern rules.
- `src/pattern-lock.js` — interactive SVG component.
- `src/pattern-lock.css` — themeable styling.
- `demo/` — forensic-oriented visualizer.
- `tests/` — Node built-in unit tests.

## Attribution

This rewrite is inspired by the original MIT-licensed project by **tympanix**. See `LICENSE` and `NOTICE.md`.
