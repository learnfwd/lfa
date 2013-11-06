Testing lfa
-------------

The tests are written in mocha and coffeescript, and can be run with:

`npm test`

The timeout is set to 8000ms (in `tests/mocha.opts`) because the compile process can take a bit, and since lfa is a command line tool, it is tested through child processes that run it on the command line.
