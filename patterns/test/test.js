var width = 0;

casper.start('test/project/_build/index.html')
.then(function() {
  width = this.evaluate(function () {
    return window.innerWidth;
  });
  
  // basic_body: Screenshot the body.
  phantomcss.screenshot('body', 'basic_body');
})

.then(function() {
  // leftbar_open: Trigger the leftbar to check out the table of contents.
  casper.click('#leftbar-toggle');
  
  phantomcss.screenshot('#leftbar', 'leftbar_open');
})

.then(function() {
  // leftbar_navigate: Navigate somewhere else; check if text changed and if
  // table of contents successfully hid away on the appropriate devices.
  casper.click('#leftbar > ul > li:nth-child(2) > a');
  
  phantomcss.screenshot('#leftbar', 'leftbar_navigate');
  phantomcss.screenshot('#content', 'leftbar_navigate');
})

.then(function() {
  // leftbar_active: Reopen the leftbar (on mobile devices) and check if the correct toc item is highlighted.
  if (width < 768) {
    casper.click('#leftbar-toggle');
  }
  
  phantomcss.screenshot('#leftbar > ul > li:nth-child(2) > a', 'leftbar_active');
})

.then(function() {
  // leftbar_close: Close the leftbar by clicking somewhere on the textbook.
  casper.click('#textbook');
  
  phantomcss.screenshot('body', 'leftbar_close');
})

.then(function() {
  // rightbar_open: Trigger the rightbar.
  casper.click('#rightbar-toggle');
  
  phantomcss.screenshot('#rightbar', 'rightbar_open');
})

.then(function() {
  // rightbar_search_filled: Type something into the search input. Check if the results
  // come in correctly and if the nice deletion button appears.
  casper.fillSelectors('#search', { 'input.search': 'working!', });
  
  phantomcss.screenshot('#search', 'rightbar_search_filled');
})

.then(function() {
  // rightbar_search_no_input: Use the pretty x button to delete the input.
  casper.click('#search-erase');
  
  phantomcss.screenshot('#search', 'rightbar_search_no_input');
})

.then(function() {
  // rightbar_search_navigate: Type something into the search input, click on the result.
  casper.fillSelectors('#search', { 'input.search': 'working!', });
  casper.click('#search-results > li:first-child > a');
  
  phantomcss.screenshot('#content', 'rightbar_search_navigate');
})

;