var App = require('lfa-core').App;
var Storage = require('lfa-core').Storage;

var _ = require('lodash');
var $ = require('jquery');

var modeLabels = [
  'Comutare automată',
  'Mod de afișare: digital responsiv',
  'Mod de afișare: carte (2 pagini)',
  'Mod de afișare: pagină lată',
];

var BUTTON_LABELS = ['fa-magic', 'fa-laptop', 'fa-columns', 'fa-file-o'];
var WIDTH_THRESHOLD = 768; // px
var HEIGHT_THRESHOLD = 768; // px
var ONE_BUTTON_MODE_TOGGLE = false; // show mode switch as one button or add them as separate entities

App.scale = 1614 / 1614;
var $img;

var hideAtom = function() {
  App.book.trigger('hide-atom');
};

function handleKeyUp(event) {
  if (event.keyCode === 27) hideAtom();
}

function avatarNotify(text) {
  App.trigger('avatar:mood', {
    mood: 'smile',
    elementPosition: 'right',
    arrowShow: true,
    globalPosition: 'center left',
    message: text,
    autoHideDelay: 2000,
    showDuration: 100,
  });
}

var lazyResize = _.throttle(function() {
  App.scale = $img.width() / 1614;
  hideAtom();
  App.book.trigger('lfa-print-page-resized');
  App.trigger('resize');
}, 100);

App.book.on('show-atom', function(atom) {
  var $atom = $('#lfa-atom-definition-' + atom);
  $('body').addClass('lfa-atom-shown');
  $atom.addClass('open-wide');
  $(document).on('keyup', handleKeyUp);
  $('.open-wide').click(function(e) {
    if ($('body').hasClass('leftbar-active')) {
      return;
    }
    e.stopPropagation();
  });
  App.trigger('resize');
});

App.book.on('hide-atom', function() {
  $(document).off('keyup', handleKeyUp);
  $('.open-wide').removeClass('open-wide');
  $('body').removeClass('lfa-atom-shown');
  $('audio,video').each(function() {
    this.pause();
    // this.currentTime = 0; // Reset time
  });
});

App.book.on('destroy-chapter', function() {
  hideAtom();
});

App.book.on('render', function() {
  $img = $('.lfa-print-page-container img');
  lazyResize();

  $('.lfa-print-zone').click(function lfaPrintZoneClick(e) {
    if ($('body').hasClass('leftbar-active')) {
      return;
    }
    var ref = $(this).attr('data-atom') || '';
    if (ref.match(/^[\w]{1,10}:/)) {
      window.open(ref);
      return;
    }

    if (ref.match(/^book\//)) {
      App.router.navigate(ref, { trigger: true });
      return;
    }

    App.book.trigger('show-atom', $(this).attr('data-atom'));
    e.stopPropagation();
  });

  $('#content').click(function() {
    if (!$('body').hasClass('leftbar-active')) {
      hideAtom();
    }
  });
});

var emphasizeHotspots = function(delay) {
  var d = 1000;

  if (typeof delay === 'number') {
    d = delay;
  }

  $('.lfa-print-zone').each(function(i, el) {
    var $el = $(el);
    var timer;

    timer = setTimeout(function() {
      $el.addClass('lfa-print-zone-hotspot-emphasized');
      timer = setTimeout(function() {
        $(el).removeClass('lfa-print-zone-hotspot-emphasized');
      }, 1500);

      var clearEmphTimeout = function() {
        clearTimeout(timer);
      };

      App.book.once('destroy-chapter', clearEmphTimeout);
      App.book.once('emphasize-hot-spots', clearEmphTimeout);
    }, Math.floor(d + 200 * Math.random()));
  });
};

App.book.on('render', emphasizeHotspots);
App.book.on('emphasize-hot-spots', function() {
  emphasizeHotspots(1);
});

App.book.once('destroy-chapter', function() {
  $('.lfa-print-zone').removeClass('lfa-print-zone-hotspot-emphasized');
});

App.book.once('render', function() {
  var mode = Storage.getItem('displayMode') || 0;
  hideAtom();

  function modeBtnOnClick(mode) {
    avatarNotify(modeLabels[mode]);

    // make sure only one view button is selected
    $('.lfa-print-toggle-btn').removeClass('selected');
    $('.lfa-view-mode-' + mode).addClass('selected');

    Storage.setItem('displayMode', mode);
    App.book.trigger('hide-atom');
    App.trigger('resize');
    App.book.trigger('lfa-print-page-resized');
  }

  if (ONE_BUTTON_MODE_TOGGLE) {
    var $btn = $('<div class="lfa-print-toggle-btn menu-item hide-small">');
    $btn.html('<i class="fa ' + BUTTON_LABELS[mode] + '"></i>');
    $btn.click(function() {
      mode++;
      mode = mode % 4; // four modes
      modeBtnOnClick(mode);
      $btn.html('<i class="fa ' + BUTTON_LABELS[mode] + '"></i>');
    });

    $('#menu').append($btn);
  } else {
    function getBlueprint(mode) {
      var currentMode = Storage.getItem('displayMode');
      var selected = parseInt(currentMode) === parseInt(mode) ? 'selected' : '';

      return [
        '<div class="lfa-print-toggle-btn lfa-view-mode-' +
          mode +
          ' menu-item hide-small ' +
          selected +
          '">',
        '  <i class="fa ' + BUTTON_LABELS[mode] + '"></i>',
        '</div>',
      ].join('\n');
    }

    var modeButtons = {
      $magic: $(getBlueprint(0)),
      $tablet: $(getBlueprint(1)),
      $columns: $(getBlueprint(2)),
      $onepage: $(getBlueprint(3)),
    };

    modeButtons.$magic.on('click', function onMagicClick() {
      modeBtnOnClick(0);
    });
    modeButtons.$tablet.on('click', function onTabletClick() {
      modeBtnOnClick(1);
    });
    modeButtons.$columns.on('click', function onColumnsClick() {
      modeBtnOnClick(2);
    });
    modeButtons.$onepage.on('click', function onOnePageClick() {
      modeBtnOnClick(3);
    });

    var hr = '<hr class="menuHr" />';

    $('#menu').append(hr);

    $('#menu').append(modeButtons.$magic);
    $('#menu').append(modeButtons.$tablet);
    $('#menu').append(modeButtons.$columns);
    $('#menu').append(modeButtons.$onepage);

    $('#menu').append(hr);
  }

  $(window).on('resize', function() {
    lazyResize();
  });

  var $closeButton = $(
    '<div id="lfa-hide-modal"><span><i class="fa fa-arrow-left"></i>Înapoi</span></div>'
  );
  $('#scrollview').append($closeButton);
});

var allClasses =
  'lfa-web-view lfa-print-view lfa-web-view-one-col lfa-web-view-two-cols';
var setViewMode = function setViewMode(mode) {
  switch (mode) {
    case '1': // web
      $('.lfa-atom').show();
      $('.lfa-print-spread').hide();
      $('#scrollview')
        .removeClass(allClasses)
        .addClass('lfa-web-view');
      break;
    case '2': // print-two-cols
      $('.lfa-atom').hide();
      $('.lfa-print-spread').show();
      $('#scrollview')
        .removeClass(allClasses)
        .addClass('lfa-print-view lfa-web-view-two-cols');
      break;
    case '3': // print-one-col
      $('.lfa-atom').hide();
      $('.lfa-print-spread').show();
      $('#scrollview')
        .removeClass(allClasses)
        .addClass('lfa-print-view lfa-web-view-one-col');
      break;
    default:
      break;
  }
};

App.book.on('lfa-print-page-resized', function() {
  var mode = Storage.getItem('displayMode') || '0';
  if (mode !== '0') {
    setViewMode(mode);
    return;
  }

  if (!$img) {
    return; // because no img is loaded
  }

  var width = $(window).width();
  var height = $(window).height();

  if (width <= WIDTH_THRESHOLD || height <= HEIGHT_THRESHOLD) {
    setViewMode('1'); // web
    return;
  }

  setViewMode('2'); // print
});

App.book.on('set-view-mode', setViewMode);
