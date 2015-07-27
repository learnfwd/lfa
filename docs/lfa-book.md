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

> TODO: Document `Chapters, BuildInfo and HotReload`
