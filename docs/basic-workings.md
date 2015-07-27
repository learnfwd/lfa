# Basic workings

## Bundles

LFA is, fundamentally, a compiler that takes JS, CSS and Jade and gives you a static webpage with all its assets.

LFA works in terms of bundles. A bundle is made up of 3 required files plus additional assets (images, fonts, etc.):

* `<bundle_name>.js`
* `<bundle_name>-main.css`
* `<bundle_name>-vendor.css`

Each time you run `lfa compile`, LFA takes your input files and outputs a bundle (by default, named `"book"`).

More bundles can be loaded from different sources in one single book. This is achieved by adding their URLs to `externalPlugins`. LFA will create a launcher `index.html` file that loads your external bundles and your local bundle.

There are 3 classes of content that LFA can put in your bundle:

### User content

This is the contents of your book. You can control the inclusion of this class of content with `--just-user` or `--no-user`.

This includes 2 modules:

* lfa-user: Contains your project's JS, CSS and mixins.
* [lfa-book]: Contains metadata about your project and API access to the chapters.

The user class is unique in the sense that it is also responsible of generating the `index.html` launcher that bootstraps your bundles.

### Core

This is the fancy reader UI that displays your content. You can control the inclusion of this class of content with `--just-core` or `--no-core`

The code for this is included in one single module: [lfa-core]

### Plugins

These are the additional plugins that you can place in `plugins/`. You can control their loading with `--just-plugins` and `--no-plugins`

## The compilation process

This is what happens when you run `lfa compile`:

1. LFA first loads the appropriate modules and plugins for your project. These can be one or more plugins, the core, and/or the user content.
2. Compilation tasks are loaded from them.
3. The tasks are run.
4. LFA saves the output of the tasks (the bundle) in `.lfa/build/release/`

## The continuous compilation process

This is what happens when you run `lfa watch`:

1. LFA first loads the appropriate modules and plugins for your project. These can be one or more plugins, the core, and/or the user content.
2. Compilation tasks are loaded from them.
3. The tasks are run. Tasks can save intermediate state for the next time they will run.
4. [Webpack Dev Server][webpack-dev-server] is started up.
5. The dev server saves the output of the tasks (the bundle) partly in-memory, partly in `.lfa/build/debug`.
6. When a file gets changed, only the tasks that depend on that file will be run again. Tasks can now use the previously stored intermediate state and set some more for the next cycle.
7. Rinse and repeat.

[lfa-book]:lfa-book.md
[lfa-core]:lfa-core.md
[webpack-dev-server]:http://webpack.github.io/docs/webpack-dev-server.html
