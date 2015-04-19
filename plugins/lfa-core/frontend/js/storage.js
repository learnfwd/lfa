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
    },
    forEachItem: function (cb) {
      for (var key in data) {
        cb(key);
      }
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

  // Testing for Safari Incognito
  var s;
  try {
    s = window.localStorage;
    s.setItem('localStorageTest');
    s.removeItem('localStorageTest');
  } catch (ex) {
    s = null;
  }
  s = s || new CookieStorage('localStorage');

  return {
    length: 0,
    clear: function () {
      //window.App.trigger('storage:clear');
      var self = this;
      self.forEachItem(function (key) {
        self.removeItem(key);
      });
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

    forEachItem: function (cb) {
      var front = 'lfa:' + BuildInfo.bookId + ':';
      function iterator(key) {
        if (key.indexOf(front) === 0) {
          cb(key.substr(front.length));
        }
      }

      if (typeof(s.forEachItem) === 'function') {
        s.forEachItem(iterator);
      } else {
        for (var key in s) {
          iterator(key);
        }
      }
    },

    toJSON: function () {
      var self = this;
      var bkup = {
        bookId: BuildInfo.bookId,
        data: {}
      };

      self.forEachItem(function (key) {
        bkup.data[key] = self.getItem(key);
      });

      return bkup;
    },

    restoreBackup: function (bkup) {
      var self = this;
      if (typeof(bkup) !== 'object' ||
          typeof(bkup.bookId) !== 'string' ||
          typeof(bkup.data) !== 'object') {
        throw new Error('Invalid backup format');
      }

      if (bkup.bookId !== BuildInfo.bookId) {
        throw new Error('This backup is for another book (' + bkup.bookId + ')');
      }

      self.clear();
      _.each(bkup.data, function (value, key) {
        self.setItem(key, value);
      });
    },
  };
};

module.exports  = new Storage();
