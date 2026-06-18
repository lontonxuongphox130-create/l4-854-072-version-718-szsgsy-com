(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var url = shell.getAttribute('data-video-url');
    var loaded = false;
    var hls = null;
    if (!video || !url) {
      return;
    }
    function attach() {
      if (loaded) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else {
        video.src = url;
      }
      loaded = true;
    }
    function start() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {});
      }
    }
    if (cover) {
      cover.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
  document.querySelectorAll('.player-shell').forEach(initPlayer);
})();
