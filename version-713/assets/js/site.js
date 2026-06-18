
(function () {
    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function bindMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function bindSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".js-search"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-empty]");
        if (!inputs.length || !cards.length) {
            return;
        }
        function apply(value) {
            var keyword = normalize(value);
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var matched = keyword === "" || text.indexOf(keyword) > -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            inputs.forEach(function (input) {
                if (document.activeElement !== input) {
                    input.value = value;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }
        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                apply(input.value);
            });
        });
    }

    function bindHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var next = parseInt(dot.getAttribute("data-hero-dot"), 10);
                show(next);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    document.addEventListener("DOMContentLoaded", function () {
        bindMobileMenu();
        bindSearch();
        bindHero();
    });
})();
