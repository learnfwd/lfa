Node API
========
```js
var LFA = require('lfa');
```

### Loading a project

```
LFA.loadProject(projectPath);
```
> Loads the project at the specified **absolute** path and returns a promise to a new lfa instance. A subdirectory of the project also works.

```
LFA.loadProject(config);
```
> Loads the project with the provided configuration and returns a promise to a new `lfa` instance.

* `config.path`: *string, required* Absolute path to the project root or a subdirectory.
* `config.pluginProject`: *boolean, optional* Treat this project as a plugin instead of as a book. Defaults to `false`. A value of `"detect"` will try to automatically detect the project type.
* `config.loadCore`: *boolean, optional* Should the core be included in the compiled bundle. Defaults to `packageJson.compileCore`.
* `config.loadPlugins`: *boolean, optional* Should local plugins be included in the compiled bundle. Defaults to `packageJson.compilePlugins`.
* `config.loadUser`: *boolean, optional* Should project-specific content (chapters and meta-data) be included in the compiled bundle. Defaults to `packageJson.compileUser`.

### Events available on `lfa`

`lfa` is an [EventEmitter] triggering the following events:
[EventEmitter]: https://nodejs.org/api/events.html

* `lfa.emit('compile-started')`: Triggered when a compilation started.
* `lfa.emit('compile-done')`: Triggered when a compilation ended successfully.
* `lfa.emit('compile-fatal-error', err)`: Triggered when a compilation failed.
* `lfa.emit('compile-error', err)`: Triggered on a recoverable error.
* `lfa.emit('compile-warning', err)`: Triggered on a compilation warning.

### Compiling the project
```js
lfa.compile(config);
```
> Compiles the project and returns a promise that gets resolved when the compilation ended.

* `config.debug`: *boolean* Compile in debug mode. Default: `false`
* `config.task`: *string* The compilation task that should be run. Default: `packageJson.lfa.defaultTask`
* `config.bundleName`: *string* The bundle name of output. Default: `"book"`
* `config.publicPath`: *string* The [public path](http://webpack.github.io/docs/configuration.html#output-publicpath) of the output bundle.
* `config.warningsAsErrors`: *boolean* Treat warnings as errors. Default: `false`

### Continuously compiling the project

```js
var watcher = lfa.watch(config);
```
> Returns a watcher object. `config` is given in the same format as the one from `compile` with some additions:

* `config.serve`: *boolean* Start a development server with hot reload. Default: `false`
* `config.port`: *number* The port for the server. Default: `8080`
* `config.verbose`: *boolean* Print detailed info on each compilation. Default: `false`

```js
watcher.start()
```
> Starts the incremental compilation cycle.

```js
watcher.stop()
```
> Stops the compilation.

#### Events available on `watcher`

Watcher is an [EventEmitter] triggering the following events:

* `watcher.emit('listening', port)`: Triggered when the server is ready.
* `watcher.emit('compile-started')`: Triggered when a compilation started.
* `watcher.emit('compile-done')`: Triggered when a compilation ended successfully.
* `watcher.emit('compile-fatal-error', err)`: Triggered when a compilation failed.
* `watcher.emit('compile-error', err)`: Triggered on a recoverable error.
* `watcher.emit('compile-warning', err)`: Triggered on a compilation warning.

### Cleaning build products

```
LFA.cleanProject(projectPath);
```
> Cleans the project at the specified **absolute** path and returns a promise that resolves when the process is complete. A subdirectory of the project also works.

```
LFA.cleanProject(config);
```

> Cleans the project with the provided configuration and returns a promise that resolves when the process is complete.

* `config.path`: *string, required* Absolute path to the project root or a subdirectory.
* `config.pluginProject`: *boolean, optional* Treat this project as a plugin instead of as a book. Defaults to `false`. A value of `"detect"` will try to automatically detect the project type.

### 2-step project loading

> TODO: example
