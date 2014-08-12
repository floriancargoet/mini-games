document.addEventListener('DOMContentLoaded', function () {
  var canvas = document.getElementById('game');
  var ctx    = canvas.getContext('2d');
  var canvasWidth  = canvas.width;
  var canvasHeight = canvas.height;

  var player = {
    x : 150,
    y : 700,
    w : 5,
    h : 5,
    inAir : true,
    jumpTime : Date.now(),
    jumpY : 0,
    jumpVy : 0
  };
  var platforms = [{
    x : 50,
    y : 700,
    w : 60,
    h : 5,
    vx : 0.1
  }, {
    x : 200,
    y : 600,
    w : 80,
    h : 5,
    vx : 0.1
  }];

  function loop(fn) {
    var now = Date.now();
    var lastTime = now;

    function frame() {
      now = Date.now();
      fn((now - lastTime) / 1000);
      lastTime = now;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function clear() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  }

  function updatePlayer(dt) {
    if (player.inAir) {
      var jumpDt = (Date.now() - player.jumpTime) / 1000;
      player.y = 4.8 * jumpDt * jumpDt + player.jumpVy * jumpDt + player.jumpY;
    }

    if (player.y > canvasHeight - player.h) {
      player.y = canvasHeight - player.h;
      player.inAir = false;
    }
  }
  function updatePlatforms(dt) {
    for (var i = 0; i < platforms.length; i++) {
      var p = platforms[i];
      p.x += p.vx * dt;
      if (p.x < 0) {
        p.x = 0;
        p.vx = - p.vx;
      }
      if (canvasWidth < p.x + p.w) {
        p.x = canvasWidth - p.w;
        p.vx = - p.vx;
      }
    }
  }
  function renderPlayer() {
    ctx.fillRect(player.x, player.y, player.w, player.h);
  }
  function renderPlatforms() {
    for (var i = 0; i < platforms.length; i++) {
      var p = platforms[i];
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }
  }

  // input events
  canvas.addEventListener('click', function () {
    if (!player.inAir) {
      player.inAir = true;
      player.jumpTime = Date.now();
      player.jumpY = player.y;
      player.jumpVy = -5;
    }
  });

  // game loop
  loop(function (dt) {
    updatePlayer(dt);
    updatePlatforms(dt);
    clear();
    renderPlayer();
    renderPlatforms();
  });
});
