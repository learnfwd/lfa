var BuildInfo = require('lfa-book').BuildInfo;
var $ = require('jquery');

var T = function (/*arguments*/) {
  var args = Array.prototype.slice.call(arguments);
  var text = args.shift();
  var params = args;

  return T.translate(text, params);
};

T._format = function (text, params) {
  if (!params || params.length === 0) {
    return text;
  }

  if (typeof(params) !== 'object' || typeof(params.length) !== 'number') {
    var item = params;
    params = [];
    params.push(item);
  }

  var pattern = new RegExp('%([1-' + params.length + '])', 'g');
  
  return String(text).replace(pattern, function (match, index) {
    return params[index - 1];
  });
};

T.translate = function (text, params) {
  var language = T.language;

  if (typeof(text) !== 'string' || text.length < 1) {
    console.warn('Problem in translation. Invalid parameter ', text, ' for', language);
  }

  var translations = T[language];

  if (!translations || typeof(translations) !== 'object') {
    translations = T[T.defaultLanguage];
    if (!translations || typeof(translations) !== 'object') {
      console.warn('Problem in translation. Cannot find ', text, ' for', language);
      return T._format(text, params);
    }
  }

  var translation = translations[text];

  if (typeof(translation) === 'function') {
    return translation(params);
  } 
  if (typeof(translation) === 'string') {
    return T._format(translation, params);
  }
  return T._format(text, params);
};

T.translateElement = function (element) {
  $(element).find('[data-translate]').each(function(idx, el) {
    $(el).html(T.translate($(el).data('translate')));
  });
};

T.languageObject = function (lang) {
  if (!lang) {
    lang = T.language;
  }
  if (!T[lang]) {
    T[lang] = {};
  }
  return T[lang];
};


T._init = function () {
  this.defaultLanguage = 'en';
  this.language = BuildInfo.language || this.defaultLanguage;
};

T._init();
module.exports = T;
