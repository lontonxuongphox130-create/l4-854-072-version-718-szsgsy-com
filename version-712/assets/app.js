(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = qs('[data-hero]');
    if (!root) return;
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    if (slides.length < 2) return;
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
        show(index);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var panel = qs('[data-filter-scope]');
    var list = qs('[data-filter-list]');
    if (!panel || !list) return;
    var input = qs('[data-filter-input]', panel);
    var category = qs('[data-filter-category]', panel);
    var year = qs('[data-filter-year]', panel);
    var region = qs('[data-filter-region]', panel);
    var empty = qs('[data-filter-empty]', panel);
    var cards = qsa('.movie-card', list);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var q = normalize(input && input.value);
      var c = normalize(category && category.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var shown = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-category'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var ok = true;
        if (q && text.indexOf(q) === -1) ok = false;
        if (c && normalize(card.getAttribute('data-category')) !== c) ok = false;
        if (y && normalize(card.getAttribute('data-year')) !== y) ok = false;
        if (r && normalize(card.getAttribute('data-region')) !== r) ok = false;
        card.hidden = !ok;
        if (ok) shown += 1;
      });

      if (empty) empty.hidden = shown !== 0;
    }

    [input, category, year, region].forEach(function (el) {
      if (el) el.addEventListener('input', apply);
      if (el) el.addEventListener('change', apply);
    });

    apply();
  }

  function setupVideo() {
    qsa('[data-video-frame]').forEach(function (frame) {
      var video = qs('video', frame);
      var button = qs('[data-video-play]', frame);
      var status = qs('[data-video-status]', frame);
      if (!video) return;
      var source = video.getAttribute('data-src');
      var loading = false;

      function setStatus(text) {
        if (status) status.textContent = text || '';
      }

      function attachSource(done) {
        if (video.getAttribute('data-ready') === '1') {
          done();
          return;
        }
        if (loading) return;
        loading = true;
        setStatus('正在加载视频...');

        function ready() {
          video.setAttribute('data-ready', '1');
          frame.classList.add('is-ready');
          setStatus('');
          done();
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          video._hls = hls;
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, ready);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) return;
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus('网络连接异常，正在重试...');
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus('媒体加载异常，正在恢复...');
              hls.recoverMediaError();
            } else {
              setStatus('视频暂时无法播放，请稍后重试');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', ready, { once: true });
        } else {
          setStatus('当前浏览器不支持此播放格式');
        }
      }

      function playVideo() {
        attachSource(function () {
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
              setStatus('请再次点击播放按钮');
            });
          }
        });
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        frame.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        frame.classList.remove('is-playing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupVideo();
  });
})();
