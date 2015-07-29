#Quick start guide

## Installation

Installation is simple. First, make sure you have [Node] installed, then simply run:

```bash
npm install -g lfa
```

If it is easier for you, we also provide an official Docker distribution. Follow the instructions at the [Docker Registry](https://registry.hub.docker.com/u/learnfwd/lfa/) to get started.

## Creating a project

Run the following command:

```bash
lfa new my-new-project
```

Follow the interactive instructions and a new project will be created for you in the `my-new-project` directory.


## Running the project

Move into the project:

```bash
cd my-new-project
```

Then start the watcher:

```bash
lfa watch
```

A browser window will pop-up with your newly created project running inside. This page will automatically update as you edit and save files.

## Editing the project

You may have noticed that your project is structured in directories:

```bash
ls
assets js styles mixins text
```

Each has a particular function:

### Chapters

Every book is structured in chapters. Chapters are scrollable pages of text that the user consumes one at a time. Every `.jade` file in `text/` is a chapter. [Jade] is a terser way of writing HTML. Read up on it.

Sometimes you may need to reuse blocks of code across your chapters. Jade has a feature called [mixins]. You can and should put your mixins in `mixins/index.jade` and then directly use them in your chapters. 

You might have seen that we have some pre-defined mixins like `+title` and `+subtitle`. These are documented in the [book module documentation][lfa-book].

### Styles

We recommend that you learn [SaSS]'s indented sintax. Write your SaSS rules in `styles/main.sass`.

### Javascript

`js/index.js` is your application's main Javascript entrypoint. We're using [Webpack], so you can use `require()` to [split your code into modules](CommonJS).

For more about what you can do in Javascript, read the [reader core documentation][lfa-core]

### Assets

Throw images, sounds, videos, fonts or anything else in `assets/`. These files will be copied as they are to the output folder.

For example, if you place a photo of a kitten at `assets/img/kitten.jpg`, you can then use it in your chapters with `img(src='img/kitten.jpg')`

### Advanced use

For a more detailed explaination of the ins and outs of a LFA project, read the documentation on [Project structure](project-structure.md)

[SaSS]:http://sass-lang.com/
[Node]:https://nodejs.org/
[Jade]:http://jade-lang.com/
[mixins]:http://jade-lang.com/reference/mixins/
[CommonJS]:http://webpack.github.io/docs/commonjs.html
[Webpack]:http://webpack.github.io/
[lfa-book]:lfa-book.md
[lfa-core]:lfa-core.md
