var loaderUtils = require("loader-utils");

module.exports = function (content, map) {
  this.cacheable(true);

  var result = [];
  result.push("var css = [" + JSON.stringify(content) + "].join('');");
  result.push("var map = " + JSON.stringify(map) + ";");
	result.push("exports.push([module.id, css, \"\", map]);");

	return "exports = module.exports = require(" + loaderUtils.stringifyRequest(this, require.resolve("css-loader/lib/css-base.js")) + ")();\n" +
		result.join("\n");
};
