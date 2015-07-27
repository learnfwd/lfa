# Plugins

Plugins have a two-fold function:

1. They provide compilation tasks and rules that generate the output files.
2. They provide additional styles, mixins and JS APIs for client-side usage.

You can add a plugin to your project by simply copying the folder with its source code to the `plugins/` folder.

There is a faster way of loading plugins, though:

## External plugins

LFA compiles plugins and book data into bundles. Bundles can contain multiple plugins. Normally, `lfa compile` will compile everything (the [reader core][lfa-core], user content, local plugins) in one single bundle. This can lead to long compilation times and the need to recompile the bundle each time the core or plugins need to be updated.

You can control what LFA includes in the bundle it compiles with the `--just-*`, `--no-*` flags.

LFA will output 3 files in `.lfa/build/release`, along with other assets (images, fonts, etc.)

* `<bundle_name>.js`
* `<bundle_name>-main.css`
* `<bundle_name>-vendor.css`

You can set the bundle name with `--bundle-name`. By default it's `book`.

If you intend to host some bundles separately from the rest of the book, set `--public-path` to the URL where these will be hosted. 

Then, add the external bundle to your project with the `externalPlugins` key in `package.json`

For example, if we want to host the reader core separately from the rest of the book (which will enable much smaller compile times):

1. We'll first run `lfa compile --just-core --bundle-name lfa-core --public-path http://public.com/path` to compile the core.
2. We'll host it at `http://public.com/path/`.
3. In our project, we add `http://public.com/path/lfa-core` to `externalPlugins` and set `compileCore` to `false` so we skip the core from our project's bundle.

Similarilly, if we want to host a plugin separately:

1. In our plugin, run `lfa compile-plugin --bundle-name plugin --public-path http://where.im/hosting/it`
2. Host it at `http://where.im/hosting/it/`.
3. In out project, add `http://where.im/hosting/it/plugin` to `externalPlugins`.

[lfa-core]:lfa-core.md
