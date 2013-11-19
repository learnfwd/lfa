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

- remove man pages, trying to get publish/install working properly

### 0.0.1
(released 21/10/2013)

- initial build and release to npm