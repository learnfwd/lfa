LFA Reader Core
==================

Mixins
------

```jade
+img(path_to_image)
```
> Adds an image

```jade
+lightbox(path_to_image)
```
> Adds an image in a zoomable lightbox

```jade
+minitoc(chapter_url)
```
> Adds an inline ToC with the subchapters of the current chapter (or the one specified by `chapter_url`). `chapter_url` is the URL component after `#book/`

```jade
+youtube(video_id)
```
> Adds a YouTube video embed. `video_id` is the code after `https://youtube.com/watch?`.

```jade
+vimeo(video_id)
```
> Adds a Vimeo video embed. `video_id` is the code after `https://vimeo.com/`.

```jade
+modal(id, title)
  p Modal content here
```
> Add a Bootrap modal with the `id` attribute set to `id` and a `title`.

JS API
------

This plugin exports: `lfa-core`, `jquery`, `bootstrap`, `backbone`, `react`, `lodash`

```js
require('lfa-core')
```

### AppDispatcher
```js
var AppDispatcher = require('lfa-core').AppDispatcher;
```

This is a [Flux](http://facebook.github.io/flux) [dispatcher object](http://facebook.github.io/flux/docs/dispatcher.html#content) that should be used to connect all the actions and stores of the UI.

#### Defined events

Unfortunately, since the migration to Flux is not yet complete, `lfa-core` doesn't define any actions and instead relies on the old Backbone workflow.

### App
*Deprecated*
```js
var App = require('lfa-core').App;
```
Actually, this is the same object as `AppDispatcher`.

This is an object that supports [Backbone Events](http://backbonejs.org/#Events).

#### Defined events

`lfa-core` defines the following events on `App`:

* `App.trigger('ready')`: Called after the document finished loading.

`lfa-core` defines the following events on `App.book`:
 
* `App.book.trigger('sidebar:open', sidebarName)`: A sidebar opened.
* `App.book.trigger('sidebar:close', sidebarName)`: A sidebar closed.
* `App.book.trigger('pre-render', { chapter: chapterURL })`: Triggered before a chapter renders.
* `App.book.trigger('render', { chapter: chapterURL })`: Triggered after a chapter is rendered.
* `App.book.trigger('destroy-chapter', { chapter: chapterURL })`: Triggered before a chapter is destroyed.

`sidebarName` is one of `"leftbar"`, `"rightbar"`
`chapterURL` is the part of the URL after `#book/`

### Storage
```js
var Storage = require('lfa-core').Storage;
```

Book-local storage.

```js
Storage.getItem(key, opts)
```
> Gets the value of `key` from storage.
> 
> If `opts.global` is `true`, use domain-global storage instead of book-local storage.

```js
Storage.setItem(key, value, opts)
```
> Sets the `value` of `key` in storage. `value` and `key` must be strings.
> 
> If `opts.global` is `true`, use domain-global storage instead of book-local storage.

```js
Storage.removeItem(key, opts)
```
> Removes the item specified by `key` from storage.
> 
> If `opts.global` is `true`, use domain-global storage instead of book-local storage.

```js
Storage.clear()
```
> Removes all items from storage.

```js
Storage.forEachItem(callback)
```
> Calls `callback(key)` for each key in storage.

```js
Storage.toJSON()
```
> Returns an `object` representation of storage data.

```js
Storage.restoreBackup(backup)
```
> Replaces the contents of storage with a `backup` previously returned by `Storage.toJSON()`.


### Translate
```js
var T = require('lfa-core').Translate;
```

Translation features.

```js
T(text, params..)
```
> Translates text to the current locale, if possible, then replaces `%` tokens with `params`.
>
> **Example:** `T('These are %1 and %2', 'Alice', 'Bob')` could translate into `'Diese sind Alice unt Bob'`.

```js
T.translate(text, params)
```
> Same as `T(text, params..)`, except that `params` is an explicit array.
>
> **Example:** `T.translate('These are %1 and %2', ['Alice', 'Bob'])` could translate into `'Diese sind Alice unt Bob'`.

```js
T.translateElement(element)
```
> Traverse a DOM element or a jQuery object, and replace the content of elements with a `data-translate="translationKey"` attribute with `T(translationKey)`.
>
> **Example:** `<span data-translate="yes"></span>` could get translated into `<span data-translate="yes">Ja</span>` when `T.translateElement` is called on any of its parents.

```js
T.languageObject(lang)
```
> Gets an object on which you can define translations for the specified `lang` 2-letter language code (ISO 639-1). 
>
> Keys into this object will be the translation keys (first argument to `T()`) and values can be either strings (with optional `%` format tokens) or functions that take the format parameters.
>
> **Example:** 
> ```js
> var de = T.languageObject('de'); 
> de.yes = 'Ja';
> de.thisAndThat = '%1 unt %2';
> de.thisOrThat = function (a, b) { return a + ' oder ' + b; };
>
> // Now, if the book's language is "de":
> T('yes'); // 'Ja'
> T('thisAndThat', 'Alice', 'Bob'); // 'Alice unt Bob'
> T('thisOrThat', 'Alice', 'Bob'); // 'Alice oder Bob'
> ```


Styles
------

> TO DO: What should you override
