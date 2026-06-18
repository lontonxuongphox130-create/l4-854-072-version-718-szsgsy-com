(function() {
  const button = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (button && mobileNav) {
    button.addEventListener("click", function() {
      mobileNav.classList.toggle("open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        const nextIndex = Number(dot.getAttribute("data-hero-dot"));
        showSlide(nextIndex);
      });
    });

    window.setInterval(function() {
      showSlide(index + 1);
    }, 5200);
  }

  const searchInput = document.getElementById("siteSearch");
  const regionSelect = document.getElementById("regionFilter");
  const yearSelect = document.getElementById("yearFilter");
  const cards = Array.from(document.querySelectorAll(".movie-card"));
  const emptyState = document.querySelector("[data-empty-state]");

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    values.forEach(function(value) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  if (cards.length) {
    const regions = Array.from(new Set(cards.map(function(card) {
      return card.getAttribute("data-region") || "";
    }).filter(Boolean))).sort();

    const years = Array.from(new Set(cards.map(function(card) {
      return card.getAttribute("data-year") || "";
    }).filter(Boolean))).sort().reverse();

    fillSelect(regionSelect, regions);
    fillSelect(yearSelect, years);
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const region = regionSelect ? regionSelect.value : "";
    const year = yearSelect ? yearSelect.value : "";
    let visible = 0;

    cards.forEach(function(card) {
      const text = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-tags") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-year") || "",
        card.getAttribute("data-genre") || ""
      ].join(" ").toLowerCase();

      const matchQuery = !query || text.indexOf(query) !== -1;
      const matchRegion = !region || card.getAttribute("data-region") === region;
      const matchYear = !year || card.getAttribute("data-year") === year;
      const shouldShow = matchQuery && matchRegion && matchYear;

      card.style.display = shouldShow ? "" : "none";

      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("show", visible === 0);
    }
  }

  [searchInput, regionSelect, yearSelect].forEach(function(node) {
    if (node) {
      node.addEventListener("input", filterCards);
      node.addEventListener("change", filterCards);
    }
  });
})();
