define(function (require, exports, module) {
  module.exports = function(options) {
    var T = function (/*arguments*/) {
      var args = Array.prototype.slice.call(arguments);
      var text = args.shift();
      var params = args;

      return T.translate(text, params);
    };

    T.defaultLanguage = 'en';

    T.format = function (text, params) {
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
      var language = T.language || T.defaultLanguage;

      if (typeof(text) !== 'string' || text.length < 1) {
        console.warn('Problem in translation. Invalid parameter ', text, ' for', language);
      }

      var translations = T[language];

      if (!translations || typeof(translations) !== 'object') {
        translations = T[T.defaultLanguage];
        if (!translations || typeof(translations) !== 'object') {
          console.warn('Problem in translation. Cannot find ', text, ' for', language);
          return T.format(text, params);
        }
      }

      var translation = translations[text];

      if (typeof(translation) === 'function') {
        return translation(params);
      } else if (typeof(translation) === 'string') {
        return T.format(translation, params);
      } else {
        return T.format(text, params);
      }

      return '[' + language + ']: ' + text;
    };

    T.translateElement = function (element) {
      $(element).find('[data-translate]').each(function(idx, el) {
        $(el).html(T.translate($(el).data('translate')));
      });
    };

    T.languageObject = function (lang) {
      if (!lang) {
        lang = T.language || T.defaultLanguage;
      }
      if (!T[lang]) {
        T[lang] = {};
      }
      return T[lang];
    };

    T.init = function (options) {
      var self = this;
      self.language = (options || {}).language || self.language || self.defaultLanguage;
    };

    T.pluralize = function (what, n) {
      console.warn('This is a toy! Don\'t use pluralize!');
      var language = T.language || T.defaultLanguage;
      
      if (language !== 'en') {
        return what;
      }

      if (Math.abs(n) !== 1) {
        return what + 's';
      }

      return what;
    };

    T.genitivise = function (what) {
      console.warn('This is a toy! Don\'t use genitivise!');
      var language = T.language || T.defaultLanguage;

      switch (language) {
        case 'en':
          what = what + '\'s';
          break;
        case 'ro':
          if (what.slice(-1) === 'a') {
            return what.slice(0, -1) + 'ei';
          } else {
            return 'lui ' + what;
          }
          break;
      }

      return what;
    };

    T.init(options);
    return T;
  };
});
