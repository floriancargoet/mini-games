/*
 * Notes:
 * - the Y-axis orientation is "fixed" in rendering functions
 *
 * To do:
 * - splash animation
 * - handle standing up after crouching under platform
 * - platform generation
 *
 */

document.addEventListener('DOMContentLoaded', function () {
  var canvas = document.getElementById('game');
  var ctx    = canvas.getContext('2d');
  var canvasWidth  = canvas.width;
  var canvasHeight = canvas.height;
  var gravity = 1000;

  var player = {
    color : '#c00',
    x : 200,
    y : 60,
    w : 10,
    h : 20,
    vy : 0
  };

  var platforms = [{
    x : 0,
    y : 50,
    w : 500,
    h : 10
  }, {
    x : 500,
    y : 10,
    w : 500,
    h : 10
  }, {
    x : 600,
    y : 30,
    w : 150,
    h : 10
  }, {
    x : 700,
    y : 80,
    w : 150,
    h : 10
  }];

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

  function updatePlatforms(dt) {
    for (var i = 0; i < platforms.length; i++) {
      var platform = platforms[i];
      platform.x -= 100 * dt;
    }
  }

  function updatePlayer(dt) {
    // movement
    // jumping
    if (keyboard.up && !player.jumping) {
      player.jumping = true;
      player.vy = 400;
    }
    // crouching
    if (keyboard.down && !player.jumping) {
      player.h = 10;
    } else {
      player.h = 20;
    }

    // falling
    player.vy -= gravity * dt;
    player.y += player.vy * dt;

    // collisions
    for (var i = 0; i < platforms.length; i++) {
      var platform = platforms[i];
      if (overlap(platform, player)) {
        // collides from side => die
        if (player.x < platform.x) {
          player.x = platform.x - player.w;
          player.dead = true;
        }
        // collides from top => stop falling
        else if (player.vy < 0) {
          player.jumping = false;
          player.y = platform.y + platform.h;
          player.vy = 0;
        }
        // collides from bottom => stop jumping
        else if (player.vy > 0) {
          player.y = platform.y - player.h;
          player.vy = 0;
        }
      }

      // falls under level => die
      if (player.y <= 0) {
        player.dead = true;
      }
    }
  }

  function overlap(rect1, rect2) {
    return (((rect1.x >= rect2.x) && (rect1.x < (rect2.x + rect2.w))) || ((rect2.x >= rect1.x) && (rect2.x < (rect1.x + rect1.w)))) &&
           (((rect1.y >= rect2.y) && (rect1.y < (rect2.y + rect2.h))) || ((rect2.y >= rect1.y) && (rect2.y < (rect1.y + rect1.h))));
  }

  function render() {
    // player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, canvasHeight - player.y - player.h, player.w, player.h);

    // platform
    ctx.fillStyle = '#333';
    for (var i = 0; i < platforms.length; i++) {
      var platform = platforms[i];
      ctx.fillRect(platform.x, canvasHeight - platform.y - platform.h, platform.w, platform.h);
    }

    if (player.dead) {
      printCenteredText("You're dead", canvasWidth / 2, canvasHeight / 2);
    }
  }

  function printCenteredText(text, x, y) {
    var width = ctx.measureText(text).width;
    var height = 30;
    ctx.font = '30px sans-serif';
    ctx.fillText(text, x - width / 2, canvasHeight - y + height / 2);
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
    if (!player.dead) {
      updatePlatforms(dt);
      updatePlayer(dt);
    }
    clear();
    render();
  })
});