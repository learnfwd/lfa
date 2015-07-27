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

The main bulk of the book (the chapters) go in `text`. The chapters are sorted alphabetically and directory structure determines ToC nesting. Chapters are [Jade] files with a specific mixin API that you can read about in the [book bundle documentation](lfa-book).

The Table of Contents is determined based on the directory hierarchy of the Jade files. The first file in a directory is that chapter's cover page and the rest are its subchapters.

If this seems confusing, look at the samples from a new project's `text/` directory. You'll intuitively get it.

If you need, you can define your own mixins in `mixins/index.jade`, then use them directly in the chapters. This is faster than using [include] to include a common jade file in all your chapters.

[include]:http://jade-lang.com/reference/includes/
[lfa-book]:lfa-book.md
[Jade]:http://jade-lang.com

### Custom styling

CSS in LFA is structured in two bundles: a `main` bundle and a `vendor` bundle. Long, rarely edited or library CSS code should go into `vendor`. Common CSS should go into `main`. `vendor` will be loaded before `main`, so it's safe to override `vendor` rules from within `main`.

We use and recommend [SaSS]'s indented sintax as it's powerful and easy to write.
Write your CSS rules in `styles/main.sass`. If you use big CSS libraries or otherwise have big code that won't change too often, place it in or include it from `styles/vendor.sass`.

Since not everybody might like SaSS, you can also use the SCSS syntax, [Stylus], plain CSS, or even a JS module that exports a CSS string. Just use `.scss/.styl/.css/.js` instead of `.sass` as the file extension. You can even mix and match more than one type (`main.sass` and `main.styl` in the same project, for example).

[SaSS]:http://sass-lang.com/
[Stylus]:http://learnboost.github.io/stylus/

### Custom JS

If you need custom JS inside your book, you can place it in `js/index.js`. We use [CommonJS] for modules. Please refer to the [reader core documentation][lfa-core] for the APIs available.


### Assets directory

Any assets that should end up in the root of the compiled book reside in the `assets` directory. This should include images, videos, fonts etc.

### Plugin directory

LFA is highly extensible. Plugins reside in `plugins` in source form or are loaded as a compiled bundle at run-time from a remote URL. Refer to the [Plugins API][using-plugins] for more info.

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
* `version`: *string, required*. The version (edition) of this book.
* `keywords`: *array, required*. Needs to contain `"lfa-book"` for this to be recognized as a valid LFA project.
* `engines.lfa`: *string, required*. Semver version range specifying which versions of LFA this project works with.

### Metadata fields

* `book`: *object, optional*. Book metadata.
* `book.title`: *string, optional*. The title of the book. Defaults to the capitalized, hyphen-less `name`
* `book.language`: *string, optional*. Language of the book in [2-letter code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format. Defaults to `"en"`
* `book.textDirection`: *string, optional*. Reading direction (`"ltr"`/`"rtl"`). Defaults to `"ltr"`

### Compilation control fields

* `lfa`: *object, optional*. Compilation control settings.
* `lfa.compileCore`: *boolean, optional*. Wether the compilation should include the core framework. Defaults to `true`.
* `lfa.compilePlugins`: *boolean, optional*. Wether the compilation should include plugins from `./plugins`. Defaults to `true`
* `lfa.compileUser`: *boolean, optional*. Wether the compilation should include the actual book chapters and metadata. Defaults to `true`
* `lfa.externalPlugins`: *array, optional*. Array of strings that, when concatenated with `".js"`, `"-main.css"`, `"-vendor.css"`, form URLs to the compiled files of an external plugins.
* `lfa.defaultTask`: *string, optional*. The compilation task that should be run when compiling this book. Defaults to `"default"`
* `lfa.dependencies`: *array, optional*. LFA plugins or modules exported by plugins that this book's JS code depends on. These will be available to `require()` and will not be included in the final bundle. The following modules are automatically included in this list: `lfa-core`, `jquery`, `bootstrap`, `backbone`, `react`, `lodash`.
* `lfa.patchServer`: *string, optional*. [Patch server](#remote-updates) URL


Remote updates
--------------

Sometimes, you might need to deploy the book to a static medium that you don't have control over (like a CD/DVD). If a bug surfaces in such a situation, you would normally be in big trouble. LFA allows you to set `lfa.patchServer` in your book's `package.json` to the URL of a server. Every time the book starts up, it will try to fire a GET request of the form `<patch server URL>?book=<book's packageJson.name>&version=<book's packageJson.version>&patchVersion=<version of currently applied patch, if any>`.

If, based on the above information, you determine that your book needs a patch applied to it, your server should return a JSON of the form:
```
{
    "meta": {
        "version": required, string // The version of the patch. will be returned as `patchVersion` in subsequent update checks.
        "hot": optional, boolean, default false // A hot patch will be ran immediately, without reloading the page.
    },
    "patch": required, string // A string of arbitrary Javascript. The patch's body. Will replace the previously stored patch.
}
```

If you determine there is no newer patch for your book, just return 200 and `{}`.

If the patch is hot, it will be applied immediately, otherwise the page is reloaded. The latest patch is stored in the user's `localStorage` and will run every time they start up / reload the book.

