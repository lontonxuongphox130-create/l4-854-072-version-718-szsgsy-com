import { H as Hls } from "./hls-dru42stk.js";

function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

function setMessage(player, message) {
    var box = player.querySelector(".player-message");
    if (box) {
        box.textContent = message || "";
    }
}

function attachHls(video, source, player) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        player._hls = hls;
        return new Promise(function (resolve) {
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                resolve();
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setMessage(player, "播放源加载遇到问题，请刷新页面后重试。");
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                }
            });
        });
    }

    video.src = source;
    return Promise.resolve();
}

function startPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector(".player-start");
    var source = player.getAttribute("data-video-src");

    if (!video || !source) {
        setMessage(player, "当前影片暂未配置播放源。");
        return;
    }

    function play() {
        player.classList.add("is-playing");
        video.setAttribute("controls", "controls");
        setMessage(player, "正在加载播放源...");

        attachHls(video, source, player)
            .then(function () {
                return video.play();
            })
            .then(function () {
                setMessage(player, "");
            })
            .catch(function () {
                setMessage(player, "浏览器阻止了自动播放，请再次点击视频播放。");
                player.classList.remove("is-playing");
            });
    }

    if (button) {
        button.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            video.play();
        }
    });
}

ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
    players.forEach(startPlayer);
});
