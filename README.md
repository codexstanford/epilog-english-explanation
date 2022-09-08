## Demo

To load the demo page, run a web server in the project root (`python -m http.server` is good for this) and navigate to `<server>/demo/`.

## Packaging

`src` contains JavaScript in ES modules. Node doesn't love these, and we run in Node sometimes. `npm run package` will translate the ES modules into Node-friendly CommonJS in `dist/cjs`. Both ES and CJS modules are published, via [conditional exports](https://nodejs.org/api/packages.html#conditional-exports).
