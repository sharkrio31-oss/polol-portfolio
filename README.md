# POLOLVERSE 🐈‍⬛🌸

An immersive, interactive 3D personal portfolio built from scratch with Three.js. It features a playable miniature world with detailed environments, procedurally animated cats, gamified collectibles, and interactive 3D UI panels.

## 🚀 GitHub Pages Deployment Instructions

This project is a pure static site (HTML, CSS, Vanilla JS) that uses an ES Modules Import Map to load Three.js directly from a CDN. There is **no build step** (no Node.js, Webpack, or Vite required).

Because it uses strictly relative paths (`./src/main.js`, `./world.js`, etc.), it is natively compatible with GitHub Pages, including repository sub-paths (e.g., `username.github.io/Pololverse/`).

### How to Publish

1. **Commit your code to GitHub:**
   Upload the entire contents of this folder directly to your GitHub repository. The repository root should contain:
   - `index.html`
   - `style.css`
   - `src/` (folder containing the `.js` files)

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub.
   - Click **Settings** > **Pages** (under the "Code and automation" section).
   - Under **Build and deployment**, set the **Source** to `Deploy from a branch`.
   - Under **Branch**, select `main` (or your default branch) and select `/ (root)` as the folder.
   - Click **Save**.

3. **Wait for deployment:**
   GitHub will trigger a GitHub Actions workflow to deploy your site. After 1-2 minutes, your live URL will appear at the top of the Pages settings.

## 🛠️ Local Development

To test the project locally, you must run it through a local web server (opening `index.html` directly via `file://` will cause CORS errors due to ES Modules).

If you have Python installed:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

## 📁 Project Structure

* `index.html`: The main entry point. Contains the UI overlay and Three.js Import Map.
* `style.css`: Styles for the loading screen, UI panels, buttons, and glassmorphism effects.
* `src/main.js`: Setup for the Three.js scene, camera controls, lighting, post-processing, and animation loop.
* `src/world.js`: Contains all the procedural 3D geometry generation (desk, PC, gaming corner, cats, islands).
* `src/interactions.js`: Handles raycasting, hover effects, and click-to-focus mechanics.
* `src/ui.js`: Manages the HTML panel states, loading screen, star counter, and UI event listeners.
