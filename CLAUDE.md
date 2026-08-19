# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static one-page marketing site for PROYECTA SpA, a Chilean consultancy that manages administration and expense reporting (*rendición*) for publicly funded research projects, mainly ANID instruments (FONDECYT, MILENIO, ANILLOS). Domain: `www.proyectachilespa.cl`. Repo: `axlsoto/ProyectaSPA`.

The whole site is four tracked files: `index.html`, `styles/styles.css`, `js/main.js`, `assets/logo.png`, plus `robots.txt` and `sitemap.xml`.

## Commands

There is no build system, no package manager, no test suite, and no backend — files are served exactly as they sit in the repo.

```powershell
# Local preview (any static server; opening index.html via file:// also works)
python -m http.server 8000     # then http://localhost:8000

# Optional lint — .hintrc configures webhint (extends "development")
npx hint .
```

`node_modules/` and `.claude/` are gitignored; the site itself never consumes npm packages.

## Binding constraints (from PRODUCT.md)

`PRODUCT.md` is the product/brand source of truth. The constraints below are recorded there as confirmed decisions, not preferences:

- **Static single page, no build step, no backend, no contact form.** Conversion happens via `mailto:` and `wa.me` links only.
- **Spanish (es_CL) only.** No i18n layer. Voice is formal, uses *usted*, sober and technical — no hype, no outcome promises. Code comments and commit messages are Spanish too.
- **No invented social proof.** There is no publishable evidence today: no testimonials, client logos, project counts, amounts administered, years of experience, approval rates, or press. Sections that would normally carry social proof must persuade through methodological specificity instead. Never fabricate these.
- **WCAG AA contrast is a floor.** Every text/background pair in the palette was verified numerically and the measured ratio is written in a comment beside each token in `:root`. Several are deliberately darker than they look like they should be in order to pass: `--ambar` (#A24608, a deepened form of the logo orange — 5.01:1 on the *recessed* band, not just on base paper), `--verde` (#0F5E58), `--gris-tenue` (#5D6A65, 4.60:1 recessed) and `--sobre-osc-60` (#93A6A1, 4.81:1 on `--pizarra-2`). `--borde-control` / `--borde-control-osc` exist separately from `--linea` because a control border must clear 3:1 (WCAG 1.4.11) while a decorative divider need not. Do not lighten any of these; re-verify with a contrast script if you change one.

## Architecture

### Content duplication that must stay in sync

Several facts live in more than one place in `index.html`. Editing one copy silently desynchronizes the others:

- **FAQ text** exists twice: in the `FAQPage` JSON-LD block in `<head>` and in the `.faq` markup (`<details name="faq">`). The HTML versions are intentionally longer; keep the substance aligned, and keep the two lists in the same order — the six `<summary>` strings currently match the six JSON-LD `name` values exactly.
- **Contact data** (3 emails, 2 WhatsApp phones) appears in the `ProfessionalService` JSON-LD, the `#contacto` section, and the footer.
- **SEO metadata** is spread across `<title>`, `meta description`, canonical, Open Graph, Twitter Card, and both JSON-LD blocks. Note the existing host inconsistency: canonical/OG use `https://www.proyectachilespa.cl/` while `sitemap.xml` and `robots.txt` use the bare `https://proyectachilespa.cl/`. Pick one deliberately if you touch it.
- **The entry selector's positions** live in the HTML (`data-desde` on each `[role="tab"]`) and depend on the CSS geometry of `.eje-riel` (`margin-inline: 12.5%`, so the rail spans the first to the last of the four milestones and `data-desde` is a percentage *of the rail*: `0%`, `33.333%`, `66.667%`). Changing the number of milestones means changing both.
- Adding a section means adding its `id`, a `.barra-links` entry, and — for a new page — a `sitemap.xml` URL.

### The design concept ("el punto de entrada")

The page argues one idea, which is also the recorded positioning: *the moment you enter the project determines the administrative cost of everything that follows*. That thesis is a direct consequence of the "no publishable evidence" constraint — with no stats or testimonials available, the page has to persuade by demonstrating command of the normative process rather than by social signals.

The signature element is the hero's **entry selector** (`.entrada`): a dark instrument panel carrying the four real lifecycle milestones (adjudicación · ejecución · rendiciones · cierre) and three buttons for the three real situations in which a project arrives. Choosing one moves an amber segment showing the span PROYECTA would accompany and swaps a panel that declares the first deliverable for that case. Every value in it is drawn from `PRODUCT.md`; none is invented. Boldness is spent here — the rest of the page is kept quiet on purpose.

Three rules fall out of the concept and are easy to break by accident:

- **Numbering only where order is information.** The five methodology stages are an ordered sequence, so they are an `<ol>` with `01`–`05`. The six services are a *catalog* and the five principles are a *manifesto*, so both are `<ul>` with no sequence numbers. Don't number them.
- **Mono is for data only.** `--dato` (Geist Mono) is for things that really are data: milestone names on the axis, stage numbers, metadata keys, deliverable labels, service subject tags, plus `code`/`pre`/`kbd`/`samp`. The one deliberate exception is `.eyebrow`.
- **Equal weight renders as equal size.** The three audiences have declared equivalent weight in `PRODUCT.md`, so `.publico` cells are identical. Don't make one bigger.

Type roles: `--display`/`--ui`/`--prosa` are all Geist (one family for headings, UI chrome, and running text), `--dato` is Geist Mono. `--ancho-display`/`--ancho-titular` are held at `100%` — a leftover width-axis hook from an earlier Archivo-based system that Geist doesn't support; don't reintroduce non-100% values unless the display face changes again.

### CSS (`styles/styles.css`, single file)

Ordered deliberately; keep new rules in the matching zone rather than appending at the end:

1. `:root` tokens — color (with the measured contrast ratio noted in a comment next to each text color), type scale (`clamp()` fluid sizes), 8px spacing scale (`--sp-1`…`--sp-8`), structure (`--shell`, `--gutter`, `--nav-h`, `--radio`), motion (`--ease`, `--t-rapido`, `--t-medio`, `--t-lento`, `--t-drawer`).
2. Shared primitives — `.shell` (max-width + gutters), `.banda` (vertical rhythm) with `.banda--osc` / `.banda--hundida` variants, `.cabecera` + `.eyebrow` + `.titulo` + `.bajada` + `.nota`, `.btn` (+ `--solido` / `--filo` / `--claro`, `--lg`), the `alza` entrance keyframes and the `.revela` scroll-reveal utility.
3. Section blocks in DOM order: barra, portada, entrada (selector), manifiesto, servicios, etapas, públicos, faq, contacto, pie.
4. Accessibility — `:focus-visible`, the skip link, and a global `prefers-reduced-motion` block that also cancels the transform hover and the scroll reveal.
5. **Three responsive breakpoints at the bottom**: `≤1080px`, `≤768px` (nav becomes a drawer), `≤460px`. Because they override by cascade position, responsive tweaks belong inside these blocks.

Three structural choices worth preserving:

- **Vertical rhythm lives on `.banda`, not on the `section` element.** Using a class avoids the element-vs-class specificity collisions that made section padding hard to override. Don't reintroduce `section { padding: … }`.
- **Depth is expressed with tone and fill, not outlines.** Bands step between `--nieve`, `--nieve-2`, `--blanco` and `--pizarra`; cells are filled rather than ruled, with generous radii (`--radio-lg`). Hairlines are used sparingly. Reintroducing an outlined-grid, zero-radius broadsheet look would collapse the design into the generic treatment it was steered away from.
- **The dark bands' atmosphere is bounded.** `.banda--osc::before` and `.entrada::before` are low-opacity teal radials whose lightest point does not exceed `--pizarra-2`, which is already measured against every foreground token. Raising their opacity breaks the contrast audit.

### JS (`js/main.js`, vanilla, no modules)

Loaded as a plain `<script>` at the end of `<body>`; no `DOMContentLoaded` guard and no null checks — it queries `#navToggle`, `#navLinks`, `.barra` and `#entrada` at top level, so removing those hooks throws and breaks the rest of the file. It does four things, in order: the mobile nav drawer, smooth anchor scrolling, the hero entry selector, and the scroll reveal. The FAQ accordion is *not* among them: it is native `<details name="faq">`, so exclusive-open behavior and keyboard accessibility come from the browser. (Without `details[name]` support the exclusivity degrades to allowing several open at once, which is harmless.)

Coupling points worth knowing:

- `msCajon()` returns `340`, mirroring the `--t-drawer: 340ms` token in CSS, and returns `0` under `prefers-reduced-motion`. `cerrarCajon()` returns a Promise resolved on that timer so anchor clicks scroll only after the drawer closes. If `--t-drawer` changes, change this number to match.
- The mobile drawer is positioned `absolute` (not `fixed`) inside `.barra` on purpose: `.barra` uses `backdrop-filter`, which makes it a containing block for fixed descendants. The scrim is `body::before` toggled by the `nav-abierto` class on `<body>`, which also locks scroll.
- The entry selector is a real `tablist`: `elegirEntrada()` maintains `aria-selected`, roving `tabindex`, panel `hidden`, the `--desde` custom property on `#entrada`, and the `.eje-hito--cubierto` class on the milestones. Arrow/Home/End keys move selection.
- **The scroll reveal hides from JavaScript, never from CSS.** `.revela` elements get `.esta-oculto` added at runtime, so with JS disabled — or under `prefers-reduced-motion`, where the observer never runs — the content is visible rather than permanently blank.

Anchor links are intercepted for smooth scroll; `[id] { scroll-margin-top: calc(var(--nav-h) + 20px) }` in CSS keeps targets clear of the fixed nav.
