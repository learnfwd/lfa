//Notice the lack of css-loader. We don't want our resources to be require()'d
require('!!style-loader!simple-css-loader!stylus-loader!stylus-entrypoints?key=vendor!./dummy.styl');
