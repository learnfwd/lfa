Introduction
------------

LearnForwardAuthor is a build tool for generating HTML5 textbooks. Application structure and functionality is heavily inspired by [roots](https://github.com/jenius/roots).

Installation
------------

Make sure you have [node.js](http://nodejs.org/) installed, then just run `npm install -g lfa`. If you get permission issues asking you to re-run the command with `sudo`, you most likely have a dodgy node installation. You can probably circumvent it temporarily with `sudo -H npm install -g lfa`.

Usage
-----

LFA is a command line tool. Run `lfa` in your terminal for the basic help.

Contributing
------------

Install [vagrant](http://www.vagrantup.com/) (don't forget about [virtualbox](https://www.virtualbox.org/)), and run `vagrant up`. This will automatically provision a virtual machine with all the necessary dependencies necessary to properly test the tool.

LFA has two separate test suites: one deals with the build tool, the other deals with the functionality of the generated textbooks.

The build tool tests are located in `test/` and can be run either through `mocha` (you'll have to install it globally) or by running `npm test` in the project root folder. Reading through `test.coffee` is also a good way to get a feel for what we expect the tool to be able to do; like compiling, moving files from one folder to the other, generating a table of contents from a particular folder structure and so on.

The textbook tests are located in `patterns/test/` and run through the same `npm test` command, but this time from the `patterns/` folder. It's a PhantomCSS test suite that runs a headless Chrome browser within the Ubuntu virtual machine in vagrant. It prods around the textbook, clicks various things and takes screenshots of the application in its varying states and screen sizes.

While it is possible to run the build tool tests from outside the vagrant virtual machine to get faster suite speeds, because the visual regression PhantomCSS tests take actual screenshots of the page they would be invalidated if you ran them from a different operating system with different font rendering.

License (MIT)
-------------

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/learnfwd/lfa/trend.png)](https://bitdeli.com/free "Bitdeli Badge")