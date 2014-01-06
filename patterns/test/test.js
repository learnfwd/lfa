casper.start('test/project/_build/index.html')
.then(function() {
  // Test 1: Screenshot the body.
  phantomcss.screenshot('body', 'basic_body');
})

.then(function() {
  // Test 2: Trigger the leftbar to check out the table of contents.
  // Small devices and larger should have this already open.
  casper.click('#leftbar-toggle');
  
  phantomcss.screenshot('body', 'leftbar_open');
})

.then(function() {
  // Test 3: Navigate somewhere else; check text and if toc successfully hid away.
  casper.click('#leftbar > ul > li:nth-child(2) > a');
  
  phantomcss.screenshot('body', 'leftbar_navigate');
})

.then(function() {
  // Test 4: Reopen the leftbar and check if the correct toc item is highlighted.
  casper.click('#leftbar-toggle');
  
  phantomcss.screenshot('#leftbar > ul > li:nth-child(2) > a', 'leftbar_active');
})

.then(function() {
  // Test 5: Close the toc by clicking somewhere on the textbook.
  casper.click('#textbook');
  
  phantomcss.screenshot('body', 'leftbar_close');
})

;