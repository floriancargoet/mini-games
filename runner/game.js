/*
 * Notes:
 * - the Y-axis orientation is "fixed" in rendering functions
 *
 * To do:
 * - splash animation
 * - allow crouched fall (!= crouch mid-jump)
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
    w : 800,
    h : 10
  }, {
    x : 400,
    y : 70,
    w : 350,
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
    var rightMostPlatform = platforms[0];
    for (var i = 0; i < platforms.length; i++) {
      var platform = platforms[i];
      platform.x -= 100 * dt;
      if (platform.x + platform.w > rightMostPlatform.x + rightMostPlatform.w) {
        rightMostPlatform = platform;
      }
      if (platform.x > platform.w < 0) {
        platform.dead = true; // recycle!
      }
    }
    if (rightMostPlatform.x + rightMostPlatform.w < canvasWidth) {
      createPlatform(rightMostPlatform);
    }
  }

  function createPlatform(rightMostPlatform) {
    var newPlatform;
    for (var i = 0; i < platforms.length; i++) {
      var platform = platforms[i];
      if (platform.dead) {
        newPlatform = platform;
        break;
      }
    }
    // if nothing to recycle, create one
    if (!newPlatform) {
      newPlatform = {};
      platforms.push(newPlatform);
    }
    newPlatform.x = rightMostPlatform.x + rightMostPlatform.w + 30 + Math.floor(Math.random() * 50);
    newPlatform.y = rightMostPlatform.y + Math.floor( (Math.random() - 0.5) * 16) * 10;
    newPlatform.w = 20 + Math.floor((Math.random() * canvasWidth * 0.3));
    newPlatform.h = 10;

    if (newPlatform.y < 20) {
      newPlatform.y = 20;
    }
  }

  function updatePlayer(dt) {
    player.lastX = player.x;
    player.lastY = player.y;

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
    player.jumping = true; // we are falling, the collision code may cancel this

    // collisions
    for (var i = 0; i < platforms.length; i++) {
      var platform = platforms[i];
      if (overlap(platform, player)) {
        // boolean tests
        var above = (player.lastY >= platform.y + platform.h);
        var below = (player.lastY + player.h <= platform.y);
        var leftInsidePlatform  = (player.x > platform.x && player.x < platform.x + platform.w);
        var rightInsidePlatform = (player.x + player.w > platform.x &&  player.x + player.w < platform.x + platform.w);

        // collides from above => stop falling
        if (player.vy < 0 && above) {
          player.jumping = false;
          player.y = platform.y + platform.h;
          player.vy = 0;
        }
        // collides from below => stop ascending
        else if (player.vy > 0 && below) {
          player.y = platform.y - player.h;
          player.vy = 0;
        }
        // collides from side or stand up into platform => die
        else if (leftInsidePlatform || rightInsidePlatform) {
          player.dead = true;
          if (leftInsidePlatform && rightInsidePlatform) {
            player.deathReason = 'crushed';
          } else {
            player.deathReason = 'collision';
          }
        }
      }

      // falls under level => die
      if (player.y <= 0) {
        player.y = 0;
        player.dead = true;
        player.deathReason = 'fall';
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
      var text = "You're dead";
      if (player.deathReason === 'crushed') {
        text += ' - Keep your head low!';
      }
      printCenteredText(text, canvasWidth / 2, canvasHeight / 2);
    }
  }

  function printCenteredText(text, x, y) {
    var height = 30;
    ctx.font = height + 'px sans-serif';
    var width = ctx.measureText(text).width;
    ctx.fillText(text, x - width / 2, canvasHeight - y + height / 2);
  }

  function cancelEvent(ev) {
    ev.stopPropagation();
    ev.preventDefault();
  }

  function update(dt) {
    if (player.dead) {
      return;
    }
    updatePlatforms(dt);
    updatePlayer(dt);
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

  var updateResolution = 20/1000; // seconds
  loop(function main(dt) {
    if (!player.dead) {
      // multiple micro updates
      while (dt > updateResolution) {
        update(updateResolution);
        dt -= updateResolution;
      }
      update(dt);
    }
    clear();
    render();
  })
});
