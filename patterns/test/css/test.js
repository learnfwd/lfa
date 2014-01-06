casper.start('test/project/_build/index.html')
.then(function() {
  phantomcss.screenshot('body', 'body');
})
.then(function() {
  casper.click('#rightbar-toggle');

  phantomcss.screenshot('body', 'body-rightbar-active');
});