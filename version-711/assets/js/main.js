(function () {
    "use strict";

    const select = (selector, scope) => (scope || document).querySelector(selector);
    const selectAll = (selector, scope) => Array.from((scope || document).querySelectorAll(selector));

    function initImages() {
        selectAll("img").forEach((image) => {
            image.addEventListener("error", () => {
                image.classList.add("is-missing");
            }, { once: true });
        });
    }

    function initNavigation() {
        const toggle = select("[data-menu-toggle]");
        const panel = select("[data-mobile-menu]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", () => {
            const open = !panel.classList.contains("is-open");
            panel.classList.toggle("is-open", open);
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initSearchForms() {
        selectAll("[data-search-form]").forEach((form) => {
            form.addEventListener("submit", (event) => {
                event.preventDefault();
                const input = select("input[name='q']", form);
                const keyword = input ? input.value.trim() : "";
                const target = keyword ? `./search.html?q=${encodeURIComponent(keyword)}` : "./search.html";
                window.location.href = target;
            });
        });
    }

    function cardText(card) {
        return [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.category,
            card.textContent
        ].join(" ").toLowerCase();
    }

    function initGridSearch() {
        const inputs = selectAll("[data-site-search]");
        const cards = selectAll(".movie-card, .rank-row");
        if (!inputs.length || !cards.length) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const query = params.get("q") || "";
        let activeFilter = "all";

        inputs.forEach((input) => {
            if (query && !input.value) {
                input.value = query;
            }
        });

        function applyFilter() {
            const keyword = (inputs[0].value || "").trim().toLowerCase();
            const filter = activeFilter.toLowerCase();
            cards.forEach((card) => {
                const text = cardText(card);
                const matchKeyword = !keyword || text.includes(keyword);
                const matchFilter = filter === "all" || text.includes(filter);
                card.dataset.hidden = matchKeyword && matchFilter ? "false" : "true";
            });
        }

        inputs.forEach((input) => {
            input.addEventListener("input", () => {
                inputs.forEach((other) => {
                    if (other !== input) {
                        other.value = input.value;
                    }
                });
                applyFilter();
            });
        });

        selectAll("[data-filter]").forEach((button) => {
            button.addEventListener("click", () => {
                activeFilter = button.dataset.filter || "all";
                const group = button.closest("[data-filter-tabs]") || document;
                selectAll("[data-filter]", group).forEach((item) => item.classList.remove("is-active"));
                button.classList.add("is-active");
                applyFilter();
            });
        });

        applyFilter();
    }

    function initHero() {
        const root = select("[data-hero]");
        if (!root) {
            return;
        }
        const slides = selectAll("[data-hero-slide]", root);
        const dots = selectAll("[data-hero-dot]", root);
        const prev = select("[data-hero-prev]", root);
        const next = select("[data-hero-next]", root);
        if (!slides.length) {
            return;
        }
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, current) => slide.classList.toggle("is-active", current === index));
            dots.forEach((dot, current) => dot.classList.toggle("is-active", current === index));
        }

        function start() {
            stop();
            timer = window.setInterval(() => show(index + 1), 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach((dot, dotIndex) => {
            dot.addEventListener("click", () => {
                show(dotIndex);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", () => {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", () => {
                show(index + 1);
                start();
            });
        }
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initPlayers() {
        selectAll("[data-player]").forEach((player) => {
            const video = select("video", player);
            const button = select("[data-play]", player);
            if (!video) {
                return;
            }

            function loadAndPlay() {
                const source = video.dataset.src || "";
                if (!source) {
                    return;
                }
                if (player.dataset.ready !== "true") {
                    if (window.Hls && window.Hls.isSupported()) {
                        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        video.hlsInstance = hls;
                    } else {
                        video.src = source;
                    }
                    player.dataset.ready = "true";
                }
                if (button) {
                    button.classList.add("is-hidden");
                }
                const playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(() => {});
                }
            }

            if (button) {
                button.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    loadAndPlay();
                });
            }
            player.addEventListener("click", (event) => {
                if (event.target.closest("button") || event.target.closest("a")) {
                    return;
                }
                if (player.dataset.ready !== "true") {
                    loadAndPlay();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        initImages();
        initNavigation();
        initSearchForms();
        initGridSearch();
        initHero();
        initPlayers();
    });
})();
