Introduction
------------

LearnForwardAuthor is a build tool for generating HTML5 textbooks. 

Since we wanted to make it as easy as possible for everybody to pick it up and go, we decided to use the [Jade](http://jade-lang.com) and [Stylus](http://learnboost.github.io/stylus/) pre-processors instead of plain HTML and CSS. 

Jade makes HTML writing easy, allowing for short and readable markup. A good tutorial can be found [here](http://www.learnjade.com/tour/intro/). 

Stylus gives you more flexibility when writing CSS, allowing you to nest, declare variables, forget braces, loop and more. [Tutorial link](http://learnboost.github.io/stylus/try.html)

Both have huge power usage potential while also being easy to learn. Go read up on them.


Installation
------------

This guide assumes you have a POSIX environment (Linux / OS X). If you're stuck on Windows, try some cloud alternatives like [Nitrous.io](https://www.nitrous.io/), [C9](https://c9.io/), [Codio](https://codio.com/), etc.

Firstly, make sure you have [node.js](http://nodejs.org/) and [npm](https://www.npmjs.org/) installed. There are guides on the net on how to do it, but usually it boils down to `brew install npm` on OS X with [Homebrew](http://brew.sh/) or `sudo apt-get install npm` on Ubuntu-based Linux distros.

After that, run:

```bash
$ npm install -g lfa
```

If you get permission issues you most likely have a dodgy node installation. You can probably circumvent it temporarily with `sudo -H npm install -g lfa`.

Usage
-----

LFA is a command line tool. For the basic help, run:

```bash
$ lfa
```

Quick start guide
-----------------

Let's create a new project:

```bash
$ lfa new my-first-book
$ cd my-first-book
```

Your project structure should look something like this:

```bash
$ tree
.
|-- config.yml
|-- css
|   `-- master.styl
|-- img
|   `-- kitten.jpg
`-- text
    |-- ch01
    |   |-- 00.jade
    |   |-- 01.jade
    |   `-- 02.jade
    `-- ch02.jade
```

`config.yml` is the main configuration file. This is where you set up project settings like the title or language of the book

The [Jade](http://jade-lang.com) files in `text/` make up for the book's chapters. The table of contents is generated automatically based on the folder hierarchy.
As mentioned, for CSS, we use [Stylus](http://learnboost.github.io/stylus/). You should include whatever styles you have in `css/master.styl` or in `@import`-ed stylus or CSS files.  Any other assets can be placed in any other subdirectory of the project.

Let's start editing our new project. Before we do that, we start the watcher:

```bash
$ lfa watch
```

By now, a browser tab should have popped up for you. You can now start editing files with your [favorite text editor](http://en.wikipedia.org/wiki/Editor_war) and, as soon as you save, the watcher will reload the page for you.

We built in some useful mixins and libraries (like [Bootstrap](http://getbootstrap.com/), [FontAwesome](http://fortawesome.github.io/Font-Awesome/), [modernizr](http://modernizr.com/), etc.) for you. For example, let's put up 2 kittens side-by-side in jade:

```jade
.row
  .col-sm-6
    +img('img/kitten.jpg')
  .col-sm-6
    +img('img/kitten.jpg')
```

The end result:

![Kittens](https://cloud.githubusercontent.com/assets/428060/5070005/b64fb396-6e6a-11e4-9064-77dc8f36f8fe.png)

See [Bootstrap](http://getbootstrap.com) to understand what `row` and `col-sm-` mean in the code above.

The tags starting with `+` are called 'mixins'. Mixins are like functions in Jade (they return HTML snippets). We made a few mixins for you, such as `+img` and `+lightbox`.
Create your own mixins to make your life easier.

Contributing
------------

Just clone this repo, then use Pull Requests. Most of the tests are out-dated.

License (Mozilla Public License 2.0)
-------------

See [license.txt](license.txt).

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/learnfwd/lfa/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
