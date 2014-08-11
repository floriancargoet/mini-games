document.addEventListener('DOMContentLoaded', function () {
  var canvas = document.getElementById('game');
  var ctx    = canvas.getContext('2d');
  var canvasWidth  = canvas.width;
  var canvasHeight = canvas.height;
  var gravity = 1000;

  player = {
    color : '#c00',
    x : 200,
    y : 50,
    w : 10,
    h : 20,
    vy : 0
  };

  var keyboard = {
    keys : {
      38 : 'up',
      40 : 'down'
    }
  };


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

  function update(dt) {
    if (keyboard.up && ! player.jumping) {
      player.jumping = true;
      player.vy = 400;
    }
    if (keyboard.down && !player.jumping) {
      player.h = 10;
    } else {
      player.h = 20;
    }

    if (player.jumping) {
      player.vy -= gravity * dt;
    }

    player.y += player.vy * dt;

    if (player.y <= 50) {
      player.jumping = false;
      player.y = 50;
    }
  }

  function render() {
    // player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, canvasHeight - player.y - player.h, player.w, player.h);

    // platform
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 300 - 50, 800, 10);
  }


  function cancelEvent(ev) {
    ev.stopPropagation();
    ev.preventDefault();
  }

  document.addEventListener('keydown', function onKeyDown(ev) {
    var key = keyboard.keys[ev.which];
    if (key) {
      keyboard[key] = true;
      cancelEvent(ev);
      return false;
    }
  }, false);

  document.addEventListener('keyup', function onKeyUp(ev) {
    var key = keyboard.keys[ev.which];
    if (key) {
      keyboard[key] = false;
      cancelEvent(ev);
      return false;
    }
  }, false);


  loop(function main(dt) {
    update(dt);
    clear();
    render();
  })
});