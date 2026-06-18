(function() {
  function preparePlayer(video, mediaUrl) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = mediaUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls();
      hls.loadSource(mediaUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = mediaUrl;
  }

  window.initMoviePlayer = function(mediaUrl) {
    const video = document.getElementById("moviePlayer");
    const cover = document.getElementById("playerCover");
    const playButton = document.getElementById("playButton");
    let ready = false;

    if (!video || !mediaUrl) {
      return;
    }

    function begin() {
      if (cover) {
        cover.classList.add("hidden");
      }

      if (!ready) {
        preparePlayer(video, mediaUrl);
        ready = true;
      }

      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function() {});
      }
    }

    if (cover) {
      cover.addEventListener("click", begin);
    }

    if (playButton) {
      playButton.addEventListener("click", function(event) {
        event.stopPropagation();
        begin();
      });
    }

    video.addEventListener("click", function() {
      if (video.paused) {
        begin();
      }
    });
  };
})();
