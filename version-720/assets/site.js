(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHeroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function play() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var next = Number(dot.getAttribute("data-hero-dot") || 0);
                show(next);
                play();
            });
        });

        var hero = document.querySelector(".hero");
        if (hero) {
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", play);
        }
        play();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupCardFilters() {
        var toolbars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-toolbar]"));
        toolbars.forEach(function (toolbar) {
            var scope = toolbar.parentElement || document;
            var input = toolbar.querySelector("[data-card-search]");
            var category = toolbar.querySelector("[data-card-category]");
            var count = toolbar.querySelector("[data-result-count]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var noResults = null;

            function ensureNoResults() {
                if (!noResults) {
                    noResults = document.createElement("div");
                    noResults.className = "no-results";
                    noResults.textContent = "没有找到匹配内容，请尝试其他关键词。";
                    var list = scope.querySelector("[data-card-list]");
                    if (list) {
                        list.appendChild(noResults);
                    }
                }
                return noResults;
            }

            function applyFilter() {
                var query = normalize(input ? input.value : "");
                var selected = normalize(category ? category.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-category"),
                        card.getAttribute("data-region")
                    ].join(" "));
                    var cardCategory = normalize(card.getAttribute("data-category"));
                    var matched = (!query || haystack.indexOf(query) !== -1) && (!selected || cardCategory === selected);
                    card.classList.toggle("hidden-card", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = visible + " 条";
                }
                if (cards.length) {
                    ensureNoResults().style.display = visible ? "none" : "block";
                }
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }
            if (category) {
                category.addEventListener("change", applyFilter);
            }

            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q && input) {
                input.value = q;
            }
            applyFilter();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video[data-src]");
            var button = player.querySelector("[data-play-button]");
            var status = player.querySelector("[data-player-status]");
            var hls = null;
            var loaded = false;

            if (!video || !button) {
                return;
            }

            function setStatus(text) {
                if (status) {
                    status.textContent = text;
                }
            }

            function loadSource() {
                if (loaded) {
                    return Promise.resolve();
                }
                loaded = true;
                var src = video.getAttribute("data-src");
                setStatus("正在加载播放源");

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("播放源已就绪");
                    });
                    hls.on(window.Hls.Events.ERROR, function (_event, data) {
                        if (data && data.fatal) {
                            setStatus("播放异常，正在尝试恢复");
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                hls.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                hls.recoverMediaError();
                            } else {
                                hls.destroy();
                            }
                        }
                    });
                    return Promise.resolve();
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                    setStatus("播放源已就绪");
                    return Promise.resolve();
                }

                setStatus("当前浏览器需要支持 HLS 才能播放");
                return Promise.resolve();
            }

            function startPlayback() {
                loadSource().then(function () {
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.then === "function") {
                        playPromise.then(function () {
                            button.classList.add("hidden");
                            setStatus("正在播放");
                        }).catch(function () {
                            setStatus("浏览器阻止自动播放，请再次点击播放");
                        });
                    } else {
                        button.classList.add("hidden");
                        setStatus("正在播放");
                    }
                });
            }

            button.addEventListener("click", startPlayback);
            video.addEventListener("play", function () {
                button.classList.add("hidden");
                setStatus("正在播放");
            });
            video.addEventListener("pause", function () {
                setStatus("已暂停");
            });
            video.addEventListener("waiting", function () {
                setStatus("缓冲中");
            });
            video.addEventListener("ended", function () {
                button.classList.remove("hidden");
                setStatus("播放结束");
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileNav();
        setupHeroSlider();
        setupCardFilters();
        setupPlayers();
    });
})();
