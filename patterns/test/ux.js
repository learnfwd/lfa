// We need to know the width of the document to figure out if
// we're doing certain interactions or not.
var width = 0;

casper.start('test/projects/ux/_build/index.html')

.waitForUrl(/book/, function() {
  // Give JavaScript enough time to run by waiting until the URL changes.
  this.echo('Content loaded.');
})

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
  // leftbar_fold_chapter: Close a chapter and verify that it hides its children.
  casper.click('#leftbar > ul > li:nth-child(1) > a > .btn');
  
  phantomcss.screenshot('#leftbar', 'leftbar_fold_chapter');
})

.then(function() {
  // leftbar_navigate: Navigate somewhere else; check if text changed and if
  // table of contents successfully hid away on the appropriate devices.
  casper.click('#leftbar > ul > li:nth-child(2) > a');
  
  phantomcss.screenshot('#leftbar', 'leftbar_navigate');
  phantomcss.screenshot('body', 'leftbar_navigate');
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
  casper.fillSelectors('#search', { 'input.search': 'Lorem', });
  casper.click('#search-results > li:first-child > a');
  
  phantomcss.screenshot('#textbook article', 'rightbar_search_navigate');
})

.then(function() {
  // selectionbar_basic: Check if the selectionbar is hidden at first, and becomes
  // visible once you select something.
  phantomcss.screenshot('#selectionbar', 'selectionbar_basic');
  
  // Double click a random word to select it.
  this.mouse.doubleclick('p.text-left');
  // Trigger the mouseup event because casper is dum.
  this.mouse.up('#content');

  phantomcss.screenshot('#selectionbar', 'selectionbar_basic');
})

;