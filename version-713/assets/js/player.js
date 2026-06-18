
(function () {
    function attachSource(video, source) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                capLevelToPlayerSize: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            return Promise.resolve();
        }
        video.src = source;
        return Promise.resolve();
    }

    function bindPlayer(shell) {
        var video = shell.querySelector("video");
        var button = shell.querySelector(".player-cover-button");
        var source = shell.getAttribute("data-source");
        var started = false;
        if (!video || !source) {
            return;
        }
        function start() {
            if (!started) {
                started = true;
                attachSource(video, source).then(function () {
                    var action = video.play();
                    if (action && typeof action.catch === "function") {
                        action.catch(function () {});
                    }
                });
            } else {
                var action = video.play();
                if (action && typeof action.catch === "function") {
                    action.catch(function () {});
                }
            }
            if (button) {
                button.classList.add("hidden");
            }
        }
        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(bindPlayer);
    });
})();
