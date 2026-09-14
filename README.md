# Pattern Lock JS v2

A modern, dependency-free Android pattern lock component and forensic visualizer, inspired by [`tympanix/pattern-lock-js`](https://github.com/tympanix/pattern-lock-js).

[**▶ Standard demo**](https://jmarande.github.io/pattern-lock-js-v2/) · [**🔎 Forensic demo**](https://jmarande.github.io/pattern-lock-js-v2/demo/) · [Original project](https://github.com/tympanix/pattern-lock-js)

**Français** · **English below**

---

## 🇫🇷 Français

### Présentation

**Pattern Lock JS v2** est une réécriture moderne du projet `pattern-lock-js` dédiée à l’affichage, au tracé et à l’exploitation de schémas de verrouillage Android.

Le projet conserve l’approche légère en SVG, tout en remplaçant l’ancienne implémentation jQuery/Gulp par du **JavaScript natif**, les **Pointer Events** et un moteur de motif indépendant du DOM.

### Démonstrations

- **Démo standard** : tracé simple d’un schéma Android, proche de l’expérience du projet original.  
  https://jmarande.github.io/pattern-lock-js-v2/
- **Démo forensic** : visualisation et exploitation d’un schéma dans un contexte d’analyse numérique.  
  https://jmarande.github.io/pattern-lock-js-v2/demo/

### Fonctions principales

- JavaScript natif, **aucune dépendance d’exécution**.
- Compatible souris, tactile et stylet via **Pointer Events**.
- Gestion de la règle Android d’ajout automatique du point intermédiaire.
- Affichage du **sens de tracé avec des flèches**.
- Affichage du motif au format **Android 1–9**.
- Affichage des **coordonnées** du tracé.
- Saisie manuelle et rendu d’un motif existant.
- Mode lecture seule pour la visualisation.
- **Copie du schéma sous forme d’image PNG dans le presse-papiers**, avec le libellé **« Sens du code »** et la séquence Android sous le graphique.
- Export du schéma au format **SVG**.
- Fonctionnement entièrement hors ligne après chargement des fichiers.
- Moteur de motif testé indépendamment de l’interface.

### Utilisation

```html
<link rel="stylesheet" href="./src/pattern-lock.css">
<svg id="lock"></svg>

<script type="module">
  import { PatternLock } from './src/pattern-lock.js';

  const lock = new PatternLock(document.querySelector('#lock'), {
    onPattern(result) {
      console.log(result.oneBased);     // [1, 2, 5, 8]
      console.log(result.coordinates);  // [{ row: 0, col: 0 }, ...]
    }
  });
</script>
```

Afficher un motif existant :

```js
lock.setPattern('1-2-5-8');
```

La règle Android est appliquée par défaut. Par exemple, `1-3` devient `1-2-3` si le point intermédiaire n’a pas déjà été utilisé.

Pour afficher une séquence littérale sans appliquer cette règle :

```js
lock.setPattern('1-3', { applyAndroidRules: false });
```

### Développement local

```bash
npm test
npm run serve
```

Puis ouvrir :

- Démo standard : `http://localhost:8080/`
- Démo forensic : `http://localhost:8080/demo/`

---

## 🇬🇧 English

### Overview

**Pattern Lock JS v2** is a modern rewrite of `pattern-lock-js` designed to draw, render and inspect Android pattern locks.

It keeps the original lightweight SVG approach while replacing the legacy jQuery/Gulp implementation with **native JavaScript**, **Pointer Events**, and a DOM-independent pattern engine.

### Demos

- **Standard demo**: simple Android pattern drawing, close to the original project experience.  
  https://jmarande.github.io/pattern-lock-js-v2/
- **Forensic demo**: pattern visualization and handling for digital-forensics-oriented workflows.  
  https://jmarande.github.io/pattern-lock-js-v2/demo/

### Main features

- Native JavaScript with **no runtime dependency**.
- Mouse, touch and stylus support through **Pointer Events**.
- Android intermediate-node insertion rule.
- **Directional arrows** showing the drawing order.
- Android **1–9** representation.
- Pattern **coordinates** display.
- Manual input and rendering of an existing pattern.
- Read-only visualization mode.
- **Copy the diagram as a PNG image to the clipboard**, including the drawing and Android sequence below it.
- SVG export.
- Fully offline-capable once the files are loaded.
- Pattern engine tested independently from the UI.

### Usage

```html
<link rel="stylesheet" href="./src/pattern-lock.css">
<svg id="lock"></svg>

<script type="module">
  import { PatternLock } from './src/pattern-lock.js';

  const lock = new PatternLock(document.querySelector('#lock'), {
    onPattern(result) {
      console.log(result.oneBased);     // [1, 2, 5, 8]
      console.log(result.coordinates);  // [{ row: 0, col: 0 }, ...]
    }
  });
</script>
```

Render an existing pattern:

```js
lock.setPattern('1-2-5-8');
```

The Android skip rule is applied by default. For example, `1-3` becomes `1-2-3` if the intermediate node has not already been used.

To render a literal sequence without applying that rule:

```js
lock.setPattern('1-3', { applyAndroidRules: false });
```

### Local development

```bash
npm test
npm run serve
```

Then open:

- Standard demo: `http://localhost:8080/`
- Forensic demo: `http://localhost:8080/demo/`

---

## Project structure

```text
src/
  pattern-engine.js   Pure pattern/grid rules
  pattern-lock.js     Interactive SVG component
  pattern-lock.css    Themeable styles

demo/                 Forensic visualizer
tests/                Node unit tests
```

## License & attribution

Released under the **MIT License**.

This project is a modern rewrite inspired by the original MIT-licensed [`tympanix/pattern-lock-js`](https://github.com/tympanix/pattern-lock-js). The original copyright and attribution are preserved in `LICENSE` and `NOTICE.md`.
