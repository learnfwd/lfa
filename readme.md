Introduction
------------

LearnForwardAuthor is a build tool for generating HTML5 textbooks. Application structure and functionality is heavily inspired by [roots](https://github.com/jenius/roots).

Installation
------------

Make sure you have [node.js](http://nodejs.org/) installed, then run:

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
For CSS, we use [Stylus](http://learnboost.github.io/stylus/). You should include whatever styles you have in `css/master.styl` or in `@import`-ed stylus or CSS files.
Any other assets can be placed in any other subdirectory of the project

Let's start editing our new project. Before we do that, we start the watcher:

```bash
$ lfa watch
```

By now, a browser tab should have popped up for you. You can now start editing files with your [favorite text editor](http://en.wikipedia.org/wiki/Editor_war) and, as soon as you save, the watcher will reload the page for you.

We built in some useful mixins and libraries (like [Bootstrap](http://getbootstrap.com/2.3.2/), [FontAwesome](http://fortawesome.github.io/Font-Awesome/), [modernizr](http://modernizr.com/), etc.) for you. For example, let's put up 2 kittens side-by-side in jade:

```jade
.row
  .col-sm-6
    +img('img/kitten.jpg')
  .col-sm-6
    +img('img/kitten.jpg')
```

The end result:

![Kittens](https://cloud.githubusercontent.com/assets/428060/5070005/b64fb396-6e6a-11e4-9064-77dc8f36f8fe.png)

Contributing
------------

Install [vagrant](http://www.vagrantup.com/) (don't forget about [virtualbox](https://www.virtualbox.org/)), and run:

```bash
$ vagrant up
```

This will automatically provision a virtual machine with all the necessary dependencies necessary to properly test the tool. Next, you will have to ssh into the machine:

```bash
$ vagrant ssh
```

LFA has two separate test suites: one deals with the build tool, the other deals with the functionality and visuals of the generated textbooks.

---

The **build tool tests** are located in `/vagrant/test/` and can be executed via running `npm test` from the root folder:

```bash
$ pwd
/vagrant/
$ npm test
```

Reading through `test/test.coffee` is a good way to get a feel for what we expect the tool to be able to do, like compiling, moving files from one folder to the other, generating a table of contents from a particular folder structure and so on.

---

The **textbook tests** are located in `/vagrant/patterns/test/` and run through the same `npm test` command, but this time from the `patterns/` folder:
```bash
$ pwd
/vagrant/patterns
$ npm test
```

It's a [PhantomCSS](https://github.com/Huddle/PhantomCSS) (through [grunt-phantomcss](https://github.com/chrisgladd/grunt-phantomcss) to be more precise) test suite that runs a headless Chrome browser within the Ubuntu virtual machine in vagrant. It prods around a dummy textbook, clicks various things and takes screenshots of the application in its varying states and screen sizes.

---

While it is possible to run the **build tool tests** tests from outside the vagrant virtual machine to get faster suite speeds, that is not recommended for the **textbook tests**. This is because the visual regression PhantomCSS tests take actual screenshots of the page, and they would be invalidated if you ran them from a different operating system with different font rendering.

License (MIT)
-------------

See [license.txt](license.txt).

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/learnfwd/lfa/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
