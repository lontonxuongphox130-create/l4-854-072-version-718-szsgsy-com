(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    function start() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      window.clearInterval(timer);
      timer = null;
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
        stop();
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var typeSelect = scope.querySelector('[data-filter-type]');
      var yearSelect = scope.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
      var empty = scope.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');

      if (input && initial) {
        input.value = initial;
      }

      function normalized(value) {
        return String(value || '').trim().toLowerCase();
      }

      function apply() {
        var term = normalized(input ? input.value : '');
        var typeValue = normalized(typeSelect ? typeSelect.value : '');
        var yearValue = normalized(yearSelect ? yearSelect.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalized(card.getAttribute('data-search'));
          var type = normalized(card.getAttribute('data-type'));
          var year = normalized(card.getAttribute('data-year'));
          var matched = true;

          if (term && text.indexOf(term) === -1) {
            matched = false;
          }
          if (typeValue && typeValue !== 'all' && type.indexOf(typeValue) === -1) {
            matched = false;
          }
          if (yearValue && yearValue !== 'all' && year !== yearValue) {
            matched = false;
          }

          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener('change', apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
      apply();
    });
  }

  window.initMoviePlayer = function (source) {
    var video = document.querySelector('[data-player]');
    var overlay = document.querySelector('[data-play-overlay]');
    var message = document.querySelector('[data-player-message]');
    var attached = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            setMessage('播放加载中，请稍候');
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            setMessage('播放恢复中，请稍候');
          } else {
            setMessage('暂时无法播放，请稍后重试');
          }
        });
        return;
      }

      video.src = source;
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      setMessage('');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('ended', function () {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
