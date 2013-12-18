casper.start('http://localhost:3000/')
.then(function() {
  phantomcss.screenshot('body', 'body');
});