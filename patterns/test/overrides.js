casper.start('test/projects/overrides/_build/index.html')
.then(function() {
  // overrides: Screenshot the body.
  phantomcss.screenshot('body', 'overrides');
})
;