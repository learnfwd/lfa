LFA Book content bundle
==================

Mixins
------

These mixins are special and need to be at the very top of your chapter file, before any other mixins or markup.

```jade
+title(title, subtitle)
```

> Specifies the title and, optionally, the subtitle of this chaper

```jade
+subtitle(subtitle)
```

> Specifies the subtitle of this chapter

```jade
+subtitle(subtitle)
```

> Specifies the subtitle of this chapter

```jade
+hidden_from_toc
```

> Hides this chapter from the Table of Contents

```jade
+hidden_from_spine
```

> Removes this chapter from the spine (the normal pagination order)

```jade
+hidden_chapter
```

> Removes this chapter from the ToC and the spine. It will only be reachable with the link

```jade
+no_content
```

> Signals that this chapter should only exist as an entry in the ToC (a container for other chapters) and doesn't actually contain textual content.

```jade
+meta(key, value)
```

> Set any arbitrary metadata value. Used by the previous mixins

JS API
------

```js
require('lfa-book')
```

### BuildInfo

```js
var BuildInfo = require('lfa-core').BuildInfo
```

JSON with book metadata

* `BuildInfo.bookId`: *string*. Unique ID of the book. Same as `packageJson.name`.
* `BuildInfo.book.version`: *string*. The book's version. Same as `packageJson.version`.
* `BuildInfo.book.debug`: *boolean*. Wether this book is compiled for debug or release.
* `BuildInfo.book.patchServer`: *string or undefined*. The configured patch server.

* `BuildInfo.book`: *object*. Book metadata. Same as `packageJson.book`
* `BuildInfo.book.title`: *string*. The title of the book. Defaults to the capitalized, hyphen-less `name`
* `BuildInfo.book.language`: *string*. Language of the book in [2-letter code][langs] format.
* `BuildInfo.book.textDirection`: *string*. Reading direction (`"ltr"`/`"rtl"`).

* `BuildInfo.book.chapters`: *array of string*. Array of all the chapter names.
* `BuildInfo.book.spine`: *array of string*. Array of chapter names in their normal reading order.
* `BuildInfo.book.toc`: *array*. Table of contents. Array of ToC nodes.

#### Table of Contents nodes

A ToC node object corresponds with a chapter and has the following properties:

`url`: *string*. Name/URL slug of the chapter.
`locals`: *object*. Metadata set with `+meta`.
`locals.title`: *string*. Title of the chapter.
`locals.subtitle`: *string*. Subtitle of the chapter.
`locals.path`: *string*. Path of chapter relative to the `text/` folder.
`locals.noContent`: *boolean*. If `true`, this chapter is just a ToC entry and doesn't have actual content.
`children`: *array*. Array of children ToC nodes.

### Chapters

```js
var Chapters = require('lfa-core').Chapters
```

Chapter loading API.

```js
Chapters.chapterExists(chapterName)
```

> Checks if the chapter identified by `chapterName` exists. Returns `boolean`.

```js
Chapters.loadChapter(chapterName, callback)
```

> Loads the chapter identified by `chapterName` and saves it to cache. Calls `callback(error, chapterTemplate)` when done. `chapterTemplate` is a function that returns a HTML string with the contents of the chapter.

```js
Chapters.isChapterLoaded(chapterName)
```

> Checks if the chapter identified by `chapterName` is loaded in cache. Returns `boolean`.

```js
Chapters.removeLoadedChapter(chapterName)
```

> Removes the chapter identified by `chapterName` from cache.


### HotChapterReload

```js
var HotChapterReload = require('lfa-core').HotChapterReload
```

Object that notifies listeners to hot chapter content changes (as part of `lfa watch`).

```js
HotChapterReload.register(callback, target)
```

> Registers a listener that will be called with `callback.call(target, chapterName)` when a chapter changes.

```js
HotChapterReload.deregister(callback, target)
```

> Deregisters a listener matching the previously passed `callback` and `target`.

```js
HotChapterReload.deregister(callback)
```

> Deregisters all listeners matching a `callback`.

```js
HotChapterReload.deregister(null, target)
```

> Deregisters all listeners matching a `target`.


[langs]:https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
