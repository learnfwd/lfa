LFA Core Framework
==================

Mixins
------

### Metadata mixins

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
+meta(key, value)
```

> Set any arbitrary metadata value. Used by the previous mixins

### Content mixins

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
```js
require('lfa-core')
```

> TO DO: Describe App, Storage, T, etc.

Styles
------

> TO DO: What should you override
