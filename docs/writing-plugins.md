Plugins
=======

Plugins can have 2 parts (both optional): compile-time and run-time (frontend). 

At compile time you can affect the way LFA compiles your plugin's assets, JS, CSS.

At run-time you can add more functionality through CSS, JS and mixins to the final result, the same way you would in a project.

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
  },
  "engines": {
    "lfa": "~0.8.0"
  }
}
```

You can use `npm install --save` or the `dependencies` field like with any npm module to install dependencies for both the frontend and the compile-time part.

The frontend can also use modules from the `web_modules` directory.

### Minimally required fields

* `name`: *string, required*. Unique plugin name. 
* `keywords`: *array, required*. Needs to contain `"lfa-plugin"` for this to be recognized as a valid LFA plugin.
* `engines.lfa`: *string, required*. Semver version range specifying which versions of LFA this project works with.

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

The main entrypoint of your frontend is `frontend/js/index.js`. You can use the CommonJS format to export stuff from your module or `require()` stuff from `lfa.dependencies`, other files in your plugin or libraries you installed into `./node_modules` or `./web_modules`. We're using [Webpack], so you can even `require()` CSS or assets.

If you need custom Webpack loaders, put them in `web_modules`, then just use them with the standard `require('my-loader!my-file')` syntax.

We've built in loaders for CSS, JSON, JSX, Stylus and most kinds of images and fonts.

### Styles

The same `vendor`/`main` model and file types that we use in projects apply here as well. Just start editing `frontend/styles/main.css` or any of the other supported extensions.

### Mixins

You can define more Jade mixins that will be dynamically usable in a project's chapters by adding them to `frontend/styles/index.jade`.


Compiler plugins
----------------

If you provide an `index.js` or a `main` entry in `package.json`, LFA will `require()` this and expect it to export a single function. This function will be called with the current `lfa` instance when loading the project.

### Tasks

Plugins are generally composed of tasks. Tasks must return streams, generally with vinyl files flowing through them. This makes it easy to use any [gulp] plugin.

Tasks can have dependencies. These can be given by name, as globs or as an array of globs or task names. If globs or arrays match more than one task, their streams get merged.

All the streams that are returned as dependencies are patched so that they propagate their errors down when you `.pipe()`. This way, you don't have to worry about error handling.

For example:

```js
lfa.task('source:1', function () {
  return lfa.src('some_files/**/*.txt');
})

lfa.task('source:2', function () {
  return lfa.src('some_other_files/**/*.txt');
})

lfa.task('concat', ['source:*'], function (sources) {
  return sources
    .pipe(gulpConcat('all.txt'))
});
```

### Vinyl functions

```js
lfa.src()
```
Same as [vinyl-fs]'s `.src()`, but with the error piping patch and a `filterModified` gimmick (read on).

```js
lfa.dst()
```
Same as [vinyl-fs]'s `.dest()`.


### Incremental compiles

#### File dependencies

When recompiling a project with `lfa.watch()`, we don't need to re-run all the tasks unless needed. Tasks can define dependencies on files:

```js
lfa.task('source:1', function () {
  this.addFileDependencies('some_files/**/*.txt');
  return lfa.src('some_files/**/*.txt');
});
```

Have more globs in an array? No problem:

```js
this.addFileDependencies(['first_glob/**/*.txt', 'second_glob/**/*.png']);
```

We can get even more granular than that:

```js
this.addFileDependencies({
    'first_glob/**/*.txt': ['created', 'changed'] //only care when files matching this glob are created or changed
    'second_glob/**/*.png': 'all', //equivalent to ['created', 'removed', 'changed']
});
```

Sometimes it's useful to know which of our task's files changed. The following method, given some globs, will return only the files that changed from those globs:

```js
this.filterModifiedFiles(globs, actions)
```
* `globs` can be a glob or an array of file globs that will be filtered
* `actions` is an array of `'created'`, `'removed'` and `'changed'` specifying if we're interested in created, removed or changed files. Defaults to `['created', 'changed']`

Example:

```js
lfa.task('source:1', function () {
  var glob = 'some_files/**/*.txt';
  this.addFileDependencies(glob);
  // Only read files that have been created or changed
  return lfa.src(this.filterModifiedFiles(glob));
});
```

The above example works, but it has the downside of messing up the `basePath` when using globs. We have a fix for this:

```js
// Let's say that some_files/a.txt got modified.

// this will wrongly write output_folder/some_files/a.txt
lfa.src(this.filterModifiedFiles('some_files/**/*.txt'));
    .pipe(lfa.dst('output_folder')); 

// this will correctly write output_folder/a.txt
lfa.src('some_files/**/*.txt', { filterModified: this })
    .pipe(lfa.dst('output_folder')); 
```

#### Conditional dependency running

By default, when a task is re-run, it will re-run all of its dependencies. We can change that. The following code tells lfa to only run and merge those tasks where the name matches `source:*` and one of its file dependencies changed.

```js
lfa.task('minify', ['source:*'], function (sources) {
    this.setDependencyMode(sources, 'modify');
    return sources.pipe(minify());
});
```

We can also tell lfa not to ever re-run the dependency after the initial compile:

```js
this.setDependencyMode(sources, 'none');
```

### The project configuration object

`lfa.config` - Object with per-project configuration variables.

* `lfa.config.projectPath`: *string*. Absolute path to the project.
* `lfa.config.pluginProject`: *boolean*. Wether the project is a plugin or a book.
* `lfa.config.packagePath`: *string*. Absolute path to the project's `package.json`.
* `lfa.config.package`: *object*. The project's `package.json` as JSON.
* `lfa.config.tmpPath`: *string*. Absolute path to a temporary folder where you can write intermediary build products.
* `lfa.config.debugBuildPath`: *string*. Absolute path to debug build products.
* `lfa.config.releaseBuildPath`: *string*. Absolute path to non-debug build products.
* `lfa.config.book`: *object*. Book metadata. Derived from `lfa.config.package.book`.
* `lfa.config.defaultTask`: *string*. The default compilation task.
* `lfa.config.loadCore`: *boolean* Should the core be included in the compilation pipeline.
* `lfa.config.loadPlugins`: *boolean* Should local plugins be included in the compilation pipeline.
* `lfa.config.loadUser`: *boolean* Should project-specific content (chapters and meta-data) be included in the compilation pipeline.

### Compile-bound configuration

`lfa.currentCompile` - Object with the configuration of the current compile cycle.

In incremental compiles, `lfa.currentCompile` will be made available as `lfa.previousCompile` in the next compile cycle. Therefore, you can use `lfa.currentCompile` to store things that need to persist across compiles.

* `lfa.currentCompile.buildPath`: *string*. Absolute path of the final output.
* `lfa.currentCompile.publicPath`: *string*. Path where the output will be hosted.
* `lfa.currentCompile.bundleName`: *string*. The name of the final JS/CSS bundle.
* `lfa.currentCompile.debug`: *boolean*. Wether we're in debug mode or not.
* `lfa.currentCompile.warningsAsErrors`: *boolean*. Wether you should treat warnings as errors.
* `lfa.currentCompile.serve`: *boolean*. Wether this compile is meant to be served by [webpack-dev-server]. Used for `.watch()`.
* `lfa.currentCompile.watcher`: *Watcher*. The watcher instance from an incremental compile.
* `lfa.currentCompile.saveForIncremental`: *boolean*. Wether this `lfa.currentCompile` will be saved as `lfa.previousCompile` as part of the incremental compilation process.

[Webpack]:http://webpack.github.io/
[webpack-dev-server]:http://webpack.github.io/docs/webpack-dev-server.html
[gulp]:http://gulpjs.com/
[vinyl-fs]:https://github.com/wearefractal/vinyl-fs
