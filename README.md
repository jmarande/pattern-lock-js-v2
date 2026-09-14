# Pattern Lock JS v2

**Android pattern visualizer for digital forensics — French / English interface.**  
**Visualiseur de schémas Android pour la criminalistique numérique — interface français / anglais.**

[**▶ Open the forensic demo / Ouvrir la démo forensic**](https://jmarande.github.io/pattern-lock-js-v2/)

Modern, dependency-free rewrite inspired by [`tympanix/pattern-lock-js`](https://github.com/tympanix/pattern-lock-js).

---

## 🇫🇷 Français

### Présentation

**Pattern Lock JS v2** est un outil web léger destiné à **tracer, visualiser et documenter un schéma de verrouillage Android** dans un contexte forensic.

Le projet reprend l’idée du composant original `pattern-lock-js`, mais avec une implémentation moderne en **JavaScript natif**, sans jQuery ni dépendance d’exécution.

Il n’existe désormais qu’une seule interface publique : **l’interface forensic**.

### Démo

👉 **https://jmarande.github.io/pattern-lock-js-v2/**

L’interface peut être basculée directement entre **Français** et **English** avec le sélecteur `FR / EN`.

### Fonctions

- Tracé d’un schéma Android à la souris, au tactile ou au stylet.
- Saisie manuelle d’un motif existant.
- Application de la règle Android des points intermédiaires.
- Affichage du **sens du tracé avec des flèches**.
- Affichage de la séquence **Android 1–9**.
- Affichage des **coordonnées** du tracé.
- Copie du résultat sous forme **d’image PNG dans le presse-papiers**.
- L’image copiée contient le schéma, les flèches de direction et la mention **« Sens du code »** suivie de la séquence Android.
- Export du résultat au format **SVG**.
- Interface **français / anglais**.
- Fonctionnement sans dépendance externe au runtime.
- Moteur de motif indépendant du DOM et couvert par des tests unitaires.

### Utilisation comme composant

```html
<link rel="stylesheet" href="./src/pattern-lock.css">
<svg id="lock"></svg>

<script type="module">
  import { PatternLock } from './src/pattern-lock.js';

  const lock = new PatternLock(document.querySelector('#lock'), {
    onPattern(result) {
      console.log(result.oneBasedString); // "1-2-5-8"
    }
  });
</script>
```

Afficher un motif existant :

```js
lock.setPattern('1-2-5-8');
```

### Développement local

```bash
npm test
npm run serve
```

Puis ouvrir :

```text
http://localhost:8080/
```

---

## 🇬🇧 English

### Overview

**Pattern Lock JS v2** is a lightweight web tool designed to **draw, visualize and document Android unlock patterns** in a digital-forensics context.

It is inspired by the original `pattern-lock-js` component, but uses a modern **native JavaScript** implementation with no jQuery and no runtime dependency.

There is now a single public interface: the **forensic interface**.

### Demo

👉 **https://jmarande.github.io/pattern-lock-js-v2/**

The interface can be switched directly between **Français** and **English** using the `FR / EN` selector.

### Features

- Draw Android patterns with mouse, touch or stylus.
- Manually enter an existing pattern.
- Apply Android intermediate-node rules.
- Display the **drawing direction with arrows**.
- Display the **Android 1–9** sequence.
- Display pattern **coordinates**.
- Copy the result as a **PNG image directly to the clipboard**.
- The copied image includes the pattern, direction arrows and the **“Pattern direction”** label followed by the Android sequence.
- Export the result as **SVG**.
- **French / English** interface.
- No runtime dependency.
- DOM-independent pattern engine with unit tests.

### Component usage

```html
<link rel="stylesheet" href="./src/pattern-lock.css">
<svg id="lock"></svg>

<script type="module">
  import { PatternLock } from './src/pattern-lock.js';

  const lock = new PatternLock(document.querySelector('#lock'), {
    onPattern(result) {
      console.log(result.oneBasedString); // "1-2-5-8"
    }
  });
</script>
```

Render an existing pattern:

```js
lock.setPattern('1-2-5-8');
```

### Local development

```bash
npm test
npm run serve
```

Then open:

```text
http://localhost:8080/
```

---

## Project structure

```text
src/
  pattern-engine.js   Pure pattern/grid engine
  pattern-lock.js     Interactive SVG component
  pattern-lock.css    Component styling

demo/
  app.js              Forensic UI logic and FR/EN translations
  style.css           Forensic interface styling

tests/
  pattern-engine.test.js
```

## Attribution & license

Pattern Lock JS v2 is inspired by the original MIT-licensed [`tympanix/pattern-lock-js`](https://github.com/tympanix/pattern-lock-js) project.

See [`LICENSE`](./LICENSE) and [`NOTICE.md`](./NOTICE.md).
