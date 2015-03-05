var BuildInfo = require('build-info');
var _ = require('lodash');

var CookieStorage = function (type) {
  function createCookie(name, value, days) {
    var date, expires;

    if (days) {
      date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      expires = '; expires='+date.toGMTString();
    } else {
      expires = '';
    }
    document.cookie = name+'='+value+expires+'; path=/';
  }

  function readCookie(name) {
    var nameEQ = name + '=',
        ca = document.cookie.split(';'),
        i, c;

    for (i=0; i < ca.length; i++) {
      c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1,c.length);
      }

      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length,c.length);
      }
    }
    return null;
  }

  function setData(data) {
    data = JSON.stringify(data);
    if (type === 'session') {
      window.name = data;
    } else {
      createCookie('localStorage', data, 365);
    }
  }

  function clearData() {
    if (type === 'session') {
      window.name = '';
    } else {
      createCookie('localStorage', '', 365);
    }
  }

  function getData() {
    var data = type === 'session' ? window.name : readCookie('localStorage');
    return data ? JSON.parse(data) : {};
  }


  // initialise if there's already data
  var data = getData();

  return {
    length: 0,
    clear: function () {
      data = {};
      this.length = 0;
      clearData();
    },
    getItem: function (key) {
      return data[key] === undefined ? null : data[key];
    },
    key: function (i) {
      // not perfect, but works
      var ctr = 0;
      for (var k in data) {
        if (ctr === i) {
          return k;
        }
        else {
          ctr++;
        }
      }
      return null;
    },
    removeItem: function (key) {
      delete data[key];
      this.length--;
      setData(data);
    },
    setItem: function (key, value) {
      data[key] = value + ''; // forces the value to a string
      this.length++;
      setData(data);
    }
  };
};

function _fixKey(key, opts) {
  if (opts && opts.global) {
    return 'lfa:' + key;
  }
  return 'lfa:' + BuildInfo.bookId + ':' + key;
}

var Storage = function() {
  var s  = localStorage || new CookieStorage('localStorage');

  return {
    length: 0,
    clear: function () {
      //window.App.trigger('storage:clear');
      // This is super dangerous, as it kills the whole localStorage
      return s.clear();
    },

    getItem: function (key, opts) {
      //window.App.trigger('storage:getItem', key, s);
      return s.getItem(_fixKey(key, opts));
    },

    removeItem: function (key, opts) {
      //window.App.trigger('storage:removeItem', key, s);
      return s.removeItem(_fixKey(key, opts));
    },

    setItem: function (key, value, opts) {
      var args = _.extend({}, opts || {}, {key: key, value:value});
      //window.App.trigger('storage:setItem', args, s);
      return s.setItem(_fixKey(key, opts), value);
    },
  };
};

module.exports  = new Storage();
