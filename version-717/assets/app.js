(function () {
  function closestRoot(input) {
    return input.parentElement || document;
  }
  function renderHits(input) {
    var root = closestRoot(input);
    var panel = root.querySelector('.site-search-results');
    if (!panel || !window.SiteSearchData) {
      return;
    }
    var query = input.value.trim().toLowerCase();
    if (!query) {
      panel.classList.remove('active');
      panel.innerHTML = '';
      return;
    }
    var hits = window.SiteSearchData.filter(function (item) {
      return item.terms.indexOf(query) !== -1 || item.title.toLowerCase().indexOf(query) !== -1;
    }).slice(0, 12);
    panel.innerHTML = hits.map(function (item) {
      return '<a class="search-hit" href="' + item.url + '">' +
        '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">' +
        '<span><strong>' + escapeHtml(item.title) + '</strong><span>' +
        escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) +
        '</span></span></a>';
    }).join('');
    panel.classList.toggle('active', hits.length > 0);
  }
  function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, function (match) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[match];
    });
  }
  document.querySelectorAll('.site-search-input').forEach(function (input) {
    input.addEventListener('input', function () {
      renderHits(input);
    });
    input.addEventListener('focus', function () {
      renderHits(input);
    });
  });
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.header-search') && !event.target.closest('.mobile-search')) {
      document.querySelectorAll('.site-search-results').forEach(function (panel) {
        panel.classList.remove('active');
      });
    }
  });
  var toggle = document.querySelector('.menu-toggle');
  var mobile = document.querySelector('.mobile-nav');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('open');
    });
  }
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  if (slides.length > 1) {
    var current = 0;
    var show = function (next) {
      slides[current].classList.remove('active');
      current = (next + slides.length) % slides.length;
      slides[current].classList.add('active');
    };
    var nextButton = document.querySelector('.hero-next');
    var prevButton = document.querySelector('.hero-prev');
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
      });
    }
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
      });
    }
    setInterval(function () {
      show(current + 1);
    }, 5200);
  }
  document.querySelectorAll('.filter-box').forEach(function (box) {
    var input = box.querySelector('.filter-input');
    var buttons = Array.prototype.slice.call(box.querySelectorAll('.filter-btn'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var activeRegion = '';
    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var region = card.getAttribute('data-region') || '';
        var matchText = !query || haystack.indexOf(query) !== -1;
        var matchRegion = !activeRegion || region.indexOf(activeRegion) !== -1;
        card.classList.toggle('hidden-card', !(matchText && matchRegion));
      });
    }
    if (input) {
      input.addEventListener('input', applyFilter);
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        activeRegion = button.getAttribute('data-region') || '';
        applyFilter();
      });
    });
  });
  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    });
  });
})();
