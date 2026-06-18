(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });

    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    panels.forEach(function (panel) {
      var root = panel.closest("main") || document;
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-filter-list] .movie-card"));
      if (!cards.length) {
        cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list] .movie-card"));
      }

      function filter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        cards.forEach(function (card) {
          var text = [card.dataset.title, card.dataset.tags, card.dataset.region, card.dataset.type].join(" ").toLowerCase();
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchYear = !yearValue || card.dataset.year === yearValue;
          var matchType = !typeValue || card.dataset.type.indexOf(typeValue) !== -1;
          card.classList.toggle("is-hidden", !(matchQuery && matchYear && matchType));
        });
      }

      [input, year, type].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener("input", filter);
        control.addEventListener("change", filter);
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player[data-stream]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var stream = player.getAttribute("data-stream");
      var prepared = false;
      var hls = null;

      if (!video || !stream) {
        return;
      }

      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function play() {
        prepare();
        player.classList.add("is-playing");
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      function toggle() {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }
      video.addEventListener("click", toggle);
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          player.classList.remove("is-playing");
        }
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }
})();
