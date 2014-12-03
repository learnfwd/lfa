### 0.5.20
(released 02/12/2014)
- @dapetcu21: Right-to-left support

### 0.5.19
(released 16/10/2014)

- @dapetcu21: Fixed hang on loading issues
- @dapetcu21: Keyboard navigation
- @dapetcu21: Added App.on("ready") event
- @dapetcu21: Fixed scroll locking on textbooks with no browser detection
- @dapetcu21: Unselectable menu buttons toggle
- @dapetcu21: General purpose menu item styles
- @dapetcu21: Chapter jades are now only run at compile time
- @dapetcu21: Added sidebar open/close event
- @cdinu: Refactor localStorage
- @cdinu: Update JS libraries

### 0.5.18
(released 14/07/2014)

- @dapetcu21: Add unsupported browser warnings.

### 0.5.17
(released 13/07/2014)

- @tvararu: Unopacitate sidebar toggles on mousehover.

### 0.5.16
(released 13/07/2014)

- @tvararu: `window.IEProofLocalStorage`.

### 0.5.15
(released 13/07/2014)

- @tvararu: Fix mobile to not have any weird `overflow-y` jiggle.

### 0.5.14
(released 11/07/2014)

- @tvararu: Fix meta charset to standards-complaint `utf-8` declaration.

### 0.5.13
(released 10/07/2014)

- @tvararu: Wrong plugin. ._.

### 0.5.12
(released 10/07/2014)

- @dapetcu21: DOM Translation
- @tvararu: Update jQuery.hammer.

### 0.5.11
(released 10/07/2014)

- @dapetcu21: Added `android`, `msie` to Modernizr.

### 0.5.10
(released 09/07/2014)

- @dapetcu21: `language` in config.yaml sets App.T.language.
- @dapetcu21: Temporarily removed huge search data from searchjson.js.

### 0.5.9
(released 09/07/2014)

- @cdinu, @dapetcu21: App.T for localization.
- @dapetcu21: Fix :hover suppress on touch (again).

### 0.5.8
(released 09/07/2014)

- @dapetcu21: Stop interactions with content while sidebar is open.
- @dapetcu21: Fix :hover supress on touch.
- @dapetcu21: Update Font-Awesome to 4.1.0.

### 0.5.7
(released 08/07/2014)

- @dapetcu21: ToC animations.
- @dapetcu21: Mobile-friendly menus and scrolling.

### 0.5.6
(released 07/07/2014)

- @dapetcu21: Add `destroy-chapter` event on `App.book`. Fired when navigating away.

### 0.5.5
(released 04/07/2014)

- @tvararu: Remove legacy sketchpad code from `patterns/lfa-components/js/views/chapter.js`.
- @dapetcu21: Add vim `.swp/.swo` files to main textbook `.gitignore`.
- @dapetcu21: Fix `+minitoc`.
- @tvararu: Add the `cssNamespace` field to the TOC JSON.

### 0.5.4
(released 23/06/2014)

- @dapetcu21: Chapter prefetching.

### 0.5.3
(released 23/06/2014)

- @dapetcu21: Fix `watch` command.

### 0.5.2
(released 23/06/2014)

- @dapetcu21: Abstractise away jade precompiler
- @dapetcu21: Async chapter loading

### 0.5.1
(released 20/06/2014)

- @dapetcu21: import-epub supports encoded URIs.
- @dapetcu21: --copy-undeclared for import-epub copies files that are not declared in the OPF manifest
- @dapetcu21: Add id links (`#book/ch00/someid` jumps to element with `id="someid"`)

### 0.5.0
(released 19/06/2014)

- @dapetcu21: EPUB to lfa project conversion.
- @dapetcu21: Manual TOC and Spine (order of reading) support.

### 0.4.41
(released 17/06/2014)

- @dapetcu21: Client-side TOC creation.
- @dapetcu21: Move compile-time TOC logic in a separate file.
- @dapetcu21: Fix compile order (misuse of promises).
- @dapetcu21: Files are compiled only once for TOC generation
- @dapetcu21: File names in Jade errors

### 0.4.40
(released 17/06/2014)

- Fix development workflow by hardcoding stylus version in dev dependencies.

### 0.4.39
(released 16/06/2014)

- @dapetcu21: Add vim swap files to the list of compiler and watcher ignores.

### 0.4.38
(released 30/05/2014)

- Add `buzz.js`.

### 0.4.37
(released 28/05/2014)

- @cdinu: App is now Backbone Model and in a separate file. More modular.

### 0.4.36
(released 23/05/2014)

- Add `notify.js` to textbook deps.

### 0.4.35
(released 20/05/2014)

- Add `rightbar` and chapter-loading `error-message` mixins.

### 0.4.34
(released 20/05/2014)

- Minor TOC UX update to chevrons.

### 0.4.33
(released 16/05/2014)

- Better UX for next/previous chapter buttons.

### 0.4.32
(released 16/05/2014)

- Tweak TOC UX.

### 0.4.31
(released 16/05/2014)

- Fix joinClasses on the client.

### 0.4.30
(released 16/05/2014)

- Fix up TOC UX; folding chapters now works in a more intuitive way.

### 0.4.29
(released 15/05/2014)

- Change TOC to have data-url attributes on <li>'s instead of <a>'s.

### 0.4.28
(released 14/05/2014)

- Add +minitoc() mixin.

### 0.4.27
(released 09/05/2014)

- Add close button to lightbox. Somehow forgot about this code.

### 0.4.26
(released 07/05/2014)

- Add option to only target a specific folder for compiling.

### 0.4.25
(released 06/05/2014)

- Update lightbox UX.

### 0.4.24
(released 04/05/2014)

- Add sketchpad mixin.

### 0.4.23
(released 04/05/2014)

- Add lightbox mixin.

### 0.4.22
(released 17/04/2014)

- Silly error. Inverted button titles.

### 0.4.21
(released 17/04/2014)

- Add next/previous buttons to bottom of +article.

### 0.4.20
(released 14/04/2014)

- Add `include` functionality back to jade templates.

### 0.4.19
(released 06/04/2014)

- rethink `js/main.js` include; no longer needs return function.

### 0.4.18
(released 05/04/2014)

- interim build with some trial functions

### 0.4.17
(released 05/04/2014)

- remove selectionbar proof of concept; stash code away for a while to focus on more important features.

### 0.4.16
(released 24/03/2014)

- initial working highlight proof of concept. still needs notes, and some additional polish

### 0.4.15
(released 19/03/2014)

- bugfix; assets with `text` in their filenames were being renamed on the way out into the `_build` folder.

### 0.4.14
(released 16/03/2014)

- add [brand new](http://visuellegedanken.de/2014-03-13/viewport-meta-tag-minimal-ui/) `minimal-ui` viewport meta tag, because it seems like a no-brainer

### 0.4.13
(released 12/03/2014)

- found out I accidentally wrecked performance for everyone when I included some extra debugging instrumentation in watch. Oops!

### 0.4.12
(released 10/03/2014)

- new `lfa update` command. Thanks, @paulbalogh!
- added basic toc chapter folding; not that pretty, but at least it works

### 0.4.11
(released 28/02/2014)

- hopefully fix some windows related issues. Closes #62

### 0.4.10
(released 21/02/2014)

- fix compile with compression; it was breaking the main functionality

### 0.4.9
(released 20/02/2014)

- add option to include extra mixins on a per project basis

### 0.4.8
(released 17/02/2014)

- get some basic text selection working, since swipe gestures are disabled

### 0.4.7
(released 17/02/2014)

- `render` event was triggering before the actual html could load, closes #52 for real this time

### 0.4.6
(released 13/02/2014)

- textbook `main.js` will now refresh when navigating. Closes #52

### 0.4.5
(released 07/02/2014)

- inline bootstrap and font-awesome in master.css. Closes #49

### 0.4.4
(released 06/02/2014)

- remove gesture to open sidebars

### 0.4.3
(released 31/01/2014)

- minor styling update; better easings for the sidebars.

### 0.4.2
(released 30/01/2014)

- minor styling change for tablets; remove some debug messages that were showing up outside of debug mode in `watch`

### 0.4.1
(released 30/01/2014)

- replace default serif font with Georgia, because Merriweather was actually lacking a few diacritics

### 0.4.0
(released 29/01/2014)

- fix a bug where deleting jade files was causing the compiler to crash
- new precompiler that should make intermediate compile passes for individual jade files much faster
- new sidebar stylesheets that hide them by default on all resolutions
- fix some compiler issues
- vertical rhythm, new font, faster css compiles

### 0.3.3
(released 18/12/2013)

- fold lfa-patterns into lfa. add vagrant and phantomcss for testing and developing

### 0.3.2
(released 16/12/2013)

- add more information to searchjson

### 0.3.1
(released 12/12/2013)

- version bump in the hope that npm will pick it up and distribute it

### 0.3.0
(released 11/12/2013)

- LFA now produces client-side JS templates, and ships with a complete Backbone frontend
- Add search feature. Needs tests.
- LFA shouldn't compile folders that do not contain config.yml anymore.

### 0.2.7
(released 29/11/2013)

- make precompiler slightly smarter

### 0.2.6
(released 28/11/2013)

- added orphaned gh-pages branch
- change default template

### 0.2.5
(released 19/11/2013)

- add `+widget(path)` mixin

### 0.2.4
(released 19/11/2013)

- add `+cloudfront(server, name)` mixin

### 0.2.3
(released 19/11/2013)

- fix a bug where the TOC was indexing ignored files

### 0.2.2
(released 19/11/2013)

- fix windows file.url

### 0.2.1
(released 19/11/2013)

- update +redirect_home() mixin. simpler and better

### 0.2.0
(released 19/11/2013)

- add youtube, vimeo and bootstrap modal mixins
- bump version

### 0.1.17
(released 19/11/2013)

- update parallax mixin to also allow blocks

### 0.1.16
(released 19/11/2013)

- add and test dynamic TOC generator
- new jade mixin: `+toc(toc)`. generates the complete table of contents.
- new jade mixin: `+link_to(path)`. generates an a(href) link to the specified chapter. specify as relative path from within /text; i.e.: `+link_to("ch01/ch01.html")`
- new jade mixin: `+redirect_home()`, which will generate a javascript block which will redirect the current page to the first page of the entire textbook. useful in the main index.jade block
- new jade mixin: `+parallax(path)`. generates a .parallax element with the specified image
- new frontmatter variable: `hidden_toc`. when it's set to true, the jade file will not be featured in the TOC.

### 0.1.15
(released 11/11/2013)

- change the way layouts work; they are now included by default from within the tool. will be overridable from within the project in the near future
- new mixins for the new layout and folder structure. every html element that depends on relative path, such as an image or a stylesheet, now has to be inserted via appropriate mixins, that are dynamically included into the jade pipeline during compilation

### 0.1.14
(released 11/11/2013)

- didn't test the earlier `lfa new` change, misspelled a variable

### 0.1.13
(released 11/11/2013)

- change templates to no longer all output to `_build`. Instead, they will respect their specified folder structures
- get .gitignore properly copying over into new projects

### 0.1.12
(released 07/11/2013)

- add lfa-components inclusion in base compile pass
- add --components argument; pass false to turn off lfa-components folder inclusion in watch or compile. default is true, and it's also configurable from config.jade. later, maybe you'll be able to use this flag to specify a different component library.

### 0.1.11
(released 07/11/2013)

- minor help command documentation fixing
- remove .gitignore and add placeholder kitten to img folder

### 0.1.10
(released 07/11/2013)

- add `clean` command, with documentation. pretty self-explanatory, deletes the output_folder

### 0.1.9
(released 07/11/2013)

- rehaul layout system, employ new conventions: every project must have a layouts folder, the default being `/layouts` (overridable from config.jade). You can assign various layouts to keys inside the `layouts` object in config.jade and then use these keys in front-matter. The `default` key must be declared, as it is used for files that do not specify a layout.

### 0.1.8
(released 06/11/2013)

- change config.jade to actually compile with the yaml parser
- start working on the tests for the TOC generator

### 0.1.7
(released 06/11/2013)

- minor default template adjustment; wasn't redirecting to a chapter that exists
- change locals and frontmatter parsing engine to add local and global variables as expected

### 0.1.6
(released 06/11/2013)

- replace app.coffee with config.jade global configuration file. remove almost every trace of default configuration in it as well

### 0.1.5
(released 06/11/2013)

- add tests for most functionality but there are still some edge cases that I would like to cover; namely, component library importing

### 0.1.4
(released 06/11/2013)

- major default template changes to match proper structure and rename output folder to `_build`
- changed compiling behaviour. Jade files in `/text` can now be filed into as many subfolders as desired and will always output in the default compiler into `_build/`. root of project now used to store the `css` and `js` folders which get checked for matching coffeescript/stylus files before being compiled into `_build/css` and `_build/js` respectively. everything else, files of any other kind and any other subfolder in the project root, get copied verbatim to `_build`

### 0.1.3
(released 06/11/2013)

- minor .gitignore tweak for default template projects to get them to ignore /public

### 0.1.2
(released 05/11/2013)

- minor tweaks to help output
- add `create-custom-config` command and change `~/.lfarc` behaviour

### 0.1.1a
(released 29/10/2013)

- fixed watch to copy files from the correct folder

### 0.1.0a
(released 29/10/2013)

- `watch` now copies over essential javascript libraries and Bootstrap. Can't be disabled from anywhere just yet
- customize default template to correspond better to a textbook, but still needs work

### 0.0.11
(released 29/10/2013)

- add `lfa-patterns` css library, all working smoothly

### 0.0.10
(released 23/10/2013)

- add `serve` and `compile` commands

### 0.0.9
(released 23/10/2013)

- fix `watch` command, everything working now

### 0.0.8
(released 21/10/2013)

- add `watch` command, trying to get compiler to run

### 0.0.7
(released 21/10/2013)

- add `global_config`. This generates a .lfarc file in the home directory that can be overriden with various configuration options.
- add `new` command and template

### 0.0.6
(released 21/10/2013)

- version bump to test if `update-notifier` is doing anything yet

### 0.0.5
(released 21/10/2013)

- add `optimist` for options parsing
- add `update-notifier` to check for new versions
- add `shelljs` for shell process management
- add `colors` for pretty terminal output

### 0.0.4
(released 21/10/2013)

- updating version to nudge `npm publish` into cooperating

### 0.0.3
(released 21/10/2013)

- installing problems were from `package.json` misconfiguration

### 0.0.2
(released 21/10/2013)

- trying to get publish/install working properly

### 0.0.1
(released 21/10/2013)

- initial build and release to npm
