(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var isOpen = !menu.hasAttribute("hidden");
            if (isOpen) {
                menu.setAttribute("hidden", "");
                toggle.setAttribute("aria-expanded", "false");
            } else {
                menu.removeAttribute("hidden");
                toggle.setAttribute("aria-expanded", "true");
            }
        });
    }

    function setupHeroSlider() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var nextIndex = Number(dot.getAttribute("data-slide"));
                show(nextIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        hero.addEventListener("mouseleave", start);
        start();
    }

    function setupFilters() {
        var toolbars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-toolbar]"));
        toolbars.forEach(function (toolbar) {
            var container = toolbar.parentElement.querySelector("[data-card-container]");
            if (!container) {
                return;
            }
            var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card, .rank-item"));
            var input = toolbar.querySelector("[data-filter-input]");
            var year = toolbar.querySelector("[data-year-filter]");
            var region = toolbar.querySelector("[data-region-filter]");
            var reset = toolbar.querySelector("[data-filter-reset]");
            var result = toolbar.parentElement.querySelector("[data-result-count]");

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function apply() {
                var keyword = normalize(input && input.value);
                var yearValue = normalize(year && year.value);
                var regionValue = normalize(region && region.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var cardRegion = normalize(card.getAttribute("data-region"));
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchYear = !yearValue || cardYear === yearValue;
                    var matchRegion = !regionValue || cardRegion === regionValue;
                    var show = matchKeyword && matchYear && matchRegion;
                    card.classList.toggle("is-hidden", !show);
                    if (show) {
                        visible += 1;
                    }
                });

                if (result) {
                    result.textContent = "共 " + visible + " 部影片";
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }
            if (region) {
                region.addEventListener("change", apply);
            }
            if (reset) {
                reset.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    if (region) {
                        region.value = "";
                    }
                    apply();
                });
            }

            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && input) {
                input.value = query;
            }
            apply();
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHeroSlider();
        setupFilters();
    });
})();
