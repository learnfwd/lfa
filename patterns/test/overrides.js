casper.start('test/projects/overrides/_build/index.html')
.then(function() {
  // overrides: Screenshot the button, it should be red.
  phantomcss.screenshot('.btn.btn-success', 'btn_success_override');
})
;