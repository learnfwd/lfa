CLI interface
=============

Creating a new project
----------------------

```bash
lfa new <proj_dir>
```

Runs an interactive prompt that creates a new project in `proj_dir`.

* `-v --verbose`: Displays detailed error messages and warnings.

Developing with continuous compilation
--------------------------------------

```bash
lfa watch
```

Compiles and serves the project from memory, opens a browser window with the results, then watches your files for changes and updates the results in real time.

* `--book <proj_path>`: The path to the root of the project we're operating on. Defaults to a search in the current directory and its parents.
* `-v --verbose`: Displays detailed error messages and warnings.
* `-p --port <port>`: The port on which to start the server. Defaults to `$PORT` or, if that's not set, to `8080`.
* `--no-open`: Doesn't open a new browser window.
* `--bundle-name`: The name of the compiled bundle. See [External plugins](#external-plugins). Defaults to `book`.
* `--no-core`: Disables compilation of the core.
* `--no-plugins`: Disables compilation of plugins.
* `--no-user`: Disables compilation of chapters and book metadata.
* `--just-core`: Only compiles the core.
* `--just-plugins`: Only compiles the plugins.
* `--just-plugin <plugin_name>`: Only compiles a specific plugin.
* `--just-user`: Only compiles chapters and book metadata.

Building for production
-----------------------

```bash
lfa compile
```

Compiles the project for production. Results are saved in `.lfa/build/release`.

* `--book <proj_path>`: The path to the root of the project we're operating on. Defaults to a search in the current directory and its parents.
* `-v --verbose`: Displays detailed error messages and warnings.
* `--debug`: Compile a debug build instead of a production one.
* `--warnings-as-errors --Werror --werror`: Treat warnings as errors.
* `--public-path <pub_path>`: The URL where the compiled files will be hosted.
* `--bundle-name`: The name of the compiled bundle. See [External plugins](#external-plugins). Defaults to `book`.
* `--no-core`: Disables compilation of the core.
* `--no-plugins`: Disables compilation of plugins.
* `--no-user`: Disables compilation of chapters and book metadata.
* `--just-core`: Only compiles the core.
* `--just-plugins`: Only compiles the plugins.
* `--just-plugin <plugin_name>`: Only compiles a specific plugin.
* `--just-user`: Only compiles chapters and book metadata.


Removing build products
-----------------------

```bash
lfa clean
```

Removes everything from the build directory (`.lfa/build`).

* `--book <proj_path>`: The path to the root of the project we're operating on. Defaults to a search in the current directory and its parents.
* `-v --verbose`: Displays detailed error messages and warnings.



Project structure
===================

Directory structure
------------------

The directory structure of a project looks like this:

```bash
$ tree
├── .lfa
│   ├── build
│   └── package.json
├── assets
│   └── ...
├── js
│   ├── ...
│   └── index.js
├── styles
│   ├── ...
│   ├── main.styl
│   └── vendor.styl
├── plugins
│   └── ...
├── mixins
│   ├── ...
│   └── index.jade
└── text
    ├── ...
    ├── cover.jade
    └── part1
        ├── ...
        ├── ch00.jade
        └── ch01.jade
```

### Project configuration file

Project configuration is stored in `.lfa/package.json`. More about this [here](#project-configuration).

### Book content

The main bulk of the book (the chapters) go in `text`. The chapters are sorted alphabetically and directory structure determines ToC nesting. Chapters are [Jade](http://jade-lang.com) files with a specific mixin API that you can read about in the [core documentation][lfa-core].

You can also define your own mixins in `mixins/index.jade`

### Custom styling

CSS in LFA is structured in two bundles: a `main` bundle and a `vendor` bundle. Long, rarely edited or library CSS code should go into `vendor`. Common CSS should go into `main`. `vendor` will be loaded before `main`, so it's safe to override `vendor` rules from within `main`.

For CSS, you can use plain CSS (`styles/{main,vendor}.css`), [Stylus](http://learnboost.github.io/stylus/) (`styles/{main,vendor}.styl`), [SCSS](http://sass-lang.com/) (`styles/{main,vendor}.scss`), [Sass](http://sass-lang.com/) (`styles/{main,vendor}.sass`), or even a JS module that exports a CSS string (`styles/{main,vendor}.js`). You can even mix and match multiple file types in one single project.

### Custom JS

If you need custom JS inside your book, you can place it in `js/index.js`. We use CommonJS for modules. Please refer to the [core documentation][lfa-core] for the APIs available.

### Assets directory

Any assets that should end up in the root of the compiled book reside in the `assets` directory. This should include images, videos, fonts etc.

### Plugin directory

LFA is highly extensible. Plugins reside in `plugins` in source form or are loaded in compiled form at run-time from a remote URL. Refer to the [plugins API](#plugins) for more info.

Project configuration
------------------

Here's a small example of a book's `package.json`:

```json
{
  "name": "my-awesome-book",
  "version": "1.0.0",
  "keywords": [
    "lfa-book"
  ],
  "book": {
    "title": "My Awesome Book",
    "language": "en"
  },
  "engines": {
    "lfa": "~0.8.0"
  }
}
```

The format is npm-compatible, with a few extensions.

### Minimally required fields

* `name`: *string, required*. A unique project identifier. This should be different from any other book's. Only lower-case letters and hyphens allowed.
* `keywords`: *array, required*. Needs to contain `"lfa-book"` for this to be recognized as a valid LFA project.
* `engines.lfa`: *string, required*. Semver version range specifying which versions of LFA this project works with.

### Metadata fields

* `book`: *object, optional*. Book metadata.
* `book.title`: *string, optional*. The title of the book. Defaults to the capitalized, hyphen-less `name`
* `book.language`: *string, optional*. Language of the book in [2-letter code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format. Defaults to `"en"`
* `book.textDirection`: *string, optional*. Reading direction (`"ltr"`/`"rtl"`). Defaults to `"ltr"`

### Compilation control fields

* `compileCore`: *boolean, optional*. Wether the compilation should include the core framework. Defaults to `true`.
* `compilePlugins`: *boolean, optional*. Wether the compilation should include plugins from `./plugins`. Defaults to `true`
* `compileUser`: *boolean, optional*. Wether the compilation should include the actual book chapters and metadata. Defaults to `true`
* `externalPlugins`: *array, optional*. Array of strings that, when concatenated with `".js"`, `"-main.css"`, `"-vendor.css"`, form URLs to the compiled files of an external plugins.
* `defaultTask`: *string, optional*. The compilation task that should be run when compiling this book. Defaults to `"default"`

Node API
========

> TO DO

Plugins
=======

LFA takes 2 types of plugins: Local plugins and external plugins.

Local plugins are kept in the `./plugins` directory and have 2 parts (both optional): compile-time and run-time (frontend). At compile time you can affect the way LFA compiles your plugin's assets, JS, CSS. At run-time you can add more functionality through CSS, JS and mixins to the final result, the same way you would in a project.

External plugins are compiled local plugins that are loaded at run-time from an URL.

Plugin configuration
---------------------

The only required file in a plugin is an npm-compatible `package.json`. Here's an example:

```json
{
  "name": "my-awesome-plugin",
  "keywords": [
    "lfa-plugin"
  ],
  "lfa": {
    "hasMixins": false,
    "dependencies": [
      "lfa-core", "react" 
    ]
  }
}
```

You can use `npm install --save` or the `dependencies` field like with any npm module to install dependencies for both the frontend and the compile-time part.

The frontend can also use modules from the `web_modules` directory.

### Minimally required fields

* `name`: *string, required*. Unique plugin name. 
* `keywords`: *array, required*. Needs to contain `"lfa-plugin"` for this to be recognized as a valid LFA plugin.

### LFA-specific fields

* `lfa`: *object, optional*. LFA-specific settings.
* `lfa.providedDependencies`: *array, optional*. Other modules that this plugin's frontend exports other than itself. Useful for sharing big libraries like React across plugins.
* `lfa.dependencies`: *array, optional*. Other LFA plugins or modules exported by other plugins that this plugin's frontend depends on. These will be available to `require()` and will not be included in the final bundle.
* `lfa.hasJs`: *boolean, optional*. If `false`, hints the compiler that this plugin doesn't contain frontend JS. Defaults to `true`.
* `lfa.hasMixins`: *boolean, optional*. If `false`, hints the compiler that this plugin doesn't contain mixins. Defaults to `true`.
* `lfa.hasStyles`: *boolean, optional*. If `false`, hints the compiler that this plugin doesn't contain frontend CSS. Defaults to `true`.

Frontend plugins
----------------

All of the below files are optional. It's nice to let the compiler know if you're not using something, though. This way we can optimize better. For this, use `hasJs`, `hasMixins` and `hasStyles` from above.

### JS

The main entrypoint of your frontend is `frontend/js/index.js`. You can use the CommonJS format to export stuff from your module or `require()` stuff from `lfa.dependencies`, other files or libraries you installed into `node_modules` or `web_modules`. We're using [Webpack](http://webpack.github.io/), so you can even `require()` CSS or assets.

If you need custom Webpack loaders, put them in `web_modules`, then just use them with the standard `require('my-loader!my-file')` syntax.

We've built in loaders for CSS, JSON, JSX, Stylus and most kinds of images and fonts.

### Styles

The same `vendor`/`main` model and file types that we use in projects apply here as well. Just start editing `frontend/styles/main.css` or any of the other supported extensions.

### Mixins

You can define more Jade mixins that will be dynamically usable in a project's chapters by adding them to `frontend/styles/index.jade`.


Compiler plugins
----------------

If you provide an `index.js`, LFA will `require()` this and expect it to export a single function. This function will be called with the current `lfa` instance when loading the project.

> TO DO: Compiler plugin API

External plugins
----------------

LFA compiles plugins and book data into bundles. Bundles can contain multiple plugins. Normally, `lfa compile` will compile everything (the [core framework][lfa-core], user content, local plugins) in one single bundle. This can lead to long compilation times and the need to recompile the bundle each time the core or plugins need to be updated.

You can control what LFA includes in the bundle it compiles with the `--just-*`, `--no-*` flags.

LFA will output 3 files in `.lfa/build/release`, along with other assets (images, fonts, etc.)

* `<bundle_name>.js`
* `<bundle_name>-main.css`
* `<bundle_name>-vendor.css`

You can set the bundle name with `--bundle-name`. By default it's `book`.

If you intend to host some bundles separately from the rest of the book, set `--public-path` to the URL where these will be hosted. 

Then, add the external bundle to your project with the `externalPlugins` key in `package.json`

For example, if we want to host the core framework separately from the rest of the book (which will enable much smaller compile times):

1. We'll first run `lfa compile --just-core --bundle-name lfa-core --public-path http://public.com/path` to compile the core.
2. We'll host it at `http://public.com/path/`.
3. In our project, we add `http://public.com/path/lfa-core` to `externalPlugins` and set `compileCore` to `false` so we skip the core from our project's bundle.

[lfa-core]: lfa-core.md

