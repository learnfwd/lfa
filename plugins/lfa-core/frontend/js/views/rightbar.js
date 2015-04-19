var SidebarView = require('./sidebar');

var RightbarView = SidebarView.extend({
  initialize: function(options) {
    // Execute the original SidebarView initializations.
    this.constructor.__super__.initialize.apply(this, [options]);
    
    // this.search = new SearchView({
    //   el: this.$('#search'),
    //   parent: this
    // });
  }
});

module.exports = RightbarView;
