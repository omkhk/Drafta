# Drafta - Lightweight Hand-Drawn Whiteboard & Diagrams

**Drafta** is a fast, zero-bloat, privacy-first diagramming and sketching web application. Built with **React 18**, **TypeScript**, **Rough.js**, **Tailwind CSS**, and **Vite**.

All diagrams remain 100% in your browser. No accounts required, no tracking, and zero cloud lock-in.

---

## ✨ Core Features

* **📦 Hand-Drawn Boxes**: Create customizable sketchy boxes with deterministic Rough.js wobble seeds (lines never twitch on re-renders).
* **🔗 Dynamic Connectors**: Arrows snap to rectangular perimeters with mathematical raycasting and automatically follow connected shapes when moved.
* **✍️ Inline Text Editing**: Double-click any box to type inside it. Text auto-wraps, vertically centers, and renders in a hand-drawn font.
* **🎨 Style & Color Customization**:
  * **Outline / Text**: Full palette of charcoal, vibrant hues, or custom hex picker.
  * **Inside Fill**: Pastel fills with **Hachure** (hand-drawn diagonal lines), **Solid**, or **Transparent**.
  * **Sloppiness**: Choose between **Architect** (clean), **Artist** (hand-drawn), and **Cartoon** (wavy).
  * **Stroke Width & Style**: Thin / Medium / Bold, Solid vs. Dashed.
  * **Opacity**: Interactive 0%–100% transparency slider.
  * **Layers**: Bring to front, bring forward, send backward, and send to back.
* **📐 Contextual Interface**: The style panel cleanly hides when nothing is selected and appears automatically on selection.
* **💾 Storage & Export**:
  * **Download `.drafta.json`**: Portable, lightweight diagram files.
  * **Open Diagrams**: Open `.drafta`, `.json`, or legacy `.excalidraw` files.
  * **Export PNG**: One-click high-resolution PNG image rasterization.
  * **Auto-Save**: Automatic persistence in browser `localStorage`.
* **🌓 Theme Support**: Instant toggle between Light (☀️), Dark (🌙), and System (🖥️) themes.
* **🖐️ Infinite Canvas Pan & Zoom**: Pan with `Space + Drag` (or the Hand tool `H`); zoom with mouse wheel or bottom-left zoom controls `[-] 100% [+]`.

---

## 🔒 Security Hardening

* **Production Dependencies**: 0 vulnerabilities (`npm audit --omit=dev`).
* **Safe JSON Deserialization**: Strict reviver blocking prototype pollution (`__proto__`, `constructor`, `prototype`).
* **Input Validation**: Coordinate and dimension bounds enforcement, color sanitization, string length clamping.
* **DoS Protection**: File upload size capped at 15MB to prevent memory exhaustion.
* **Content Security**: No `eval`, no `dangerouslySetInnerHTML`, canvas drawing isolated from DOM injection.

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Or on Windows, simply double-click **`start.bat`**. Open **`http://localhost:5173`**.

---

## 🌐 How to Make It Live (Production Deployment)

Drafta compiles down to a 100% static client-side bundle with zero backend dependencies.

```bash
npm run build
```

This generates an optimized static bundle in the `dist/` directory (~70 kB gzipped).

### Deployment Options:

1. **Vercel**:
   ```bash
   npx vercel deploy --prod
   ```
2. **Netlify**:
   Drag-and-drop the `dist/` folder into [Netlify Drop](https://app.netlify.com/drop), or run `npx netlify deploy --prod --dir=dist`.
3. **Cloudflare Pages**:
   Connect your GitHub repository and set build command to `npm run build` with output directory `dist`.
4. **GitHub Pages**:
   Use standard GitHub Pages actions deploying the `dist` folder.
