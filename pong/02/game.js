/* jshint browser:true */
/*
 * Notes:
 * - the Y-axis orientation is "fixed" in rendering functions
 *
 */

Utils.onReady(function () {
  var canvas       = document.getElementById('game');
  var ctx          = canvas.getContext('2d');
  var canvasWidth  = canvas.width;
  var canvasHeight = canvas.height;

  var bouncePaddle   = jsfxlib.createWave(["square",0,0.201,0,0.106,0,0.026,20,223,24,0,0,0,0.01,0.0003,0,     0,0,0.5,0,0,0,0,1,0,0,0.1,0]);
  var bounceObstacle = jsfxlib.createWave(["square",0,0.201,0,0.106,0,0.026,20,223,24,0,0,0,0.01,0.0003,0,-0.602,0,0.5,0,0,0,0,1,0,0,0.1,0]);

  // clone the bounceObstacle sound to play it multiple times simultaneously
  bounceObstacle = {
    pool : [
      bounceObstacle,
      bounceObstacle.cloneNode(),
      bounceObstacle.cloneNode(),
      bounceObstacle.cloneNode(),
    ],
    i : 0,
    play : function () {
      this.pool[this.i].play();
      this.i = (this.i + 1) % this.pool.length;
    }
  };

  var keyboard = Utils.keyboard({
    38 : 'up',
    40 : 'down',
    90 : 'Z',
    83 : 'S'
  });

  var paddle1 = new Utils.Rect({
    x : 0,
    y : 0,
    w : 10,
    h : 60,
    dy : 150,
    score: 0
  });

  paddle1.center(60, canvasHeight / 2);

  var paddle2 = new Utils.Rect({
    x : 0,
    y : 0,
    w : 10,
    h : 60,
    dy : 150,
    score: 0
  })
  paddle2.center(canvasWidth - 60, canvasHeight / 2);

  var ball = new Utils.Rect({
    x : 0,
    y : 0,
    w : 10,
    h : 10,
    dx : 0,
    dy : 0,
    v : 200
  });
  resetBall();

  var obstacles = [];
  addObstacle();

  function addObstacle() {
    obstacles.push(new Utils.Rect({
      x : Utils.random.int(150, canvasWidth - 150),
      y : Utils.random.int(50 , canvasHeight - 50),
      w : Utils.random.int(10, 40),
      h : Utils.random.int(10, 40)
    }));
  }


  function resetBall() {
    ball.v = 200;
    ball.center(canvasWidth / 2, canvasHeight / 2);
    var angle = Utils.random.float(-Math.PI / 3, Math.PI / 3) + Utils.random.choice(0, Math.PI);
    setAngle(ball, angle);
  }

  function setAngle(obj, angle) {
    obj.dx = obj.v * Math.cos(angle);
    obj.dy = obj.v * Math.sin(angle);
  }

  function f(x) {
    return Math.floor(x);
  }

  function render() {
    renderUI();
    renderPaddles();
    renderObstacles();
    renderBall();
  }

  function renderUI() {
    // bg
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    // score
    Utils.printCenteredText(ctx, paddle1.score, f(canvasWidth * 0.25), canvasHeight - 50);
    Utils.printCenteredText(ctx, paddle2.score, f(canvasWidth * 0.75), canvasHeight - 50);
    // net

  }

  function renderPaddles() {
    ctx.fillStyle = 'white';
    ctx.fillRect(paddle1.x, canvasHeight - paddle1.y - paddle1.h, paddle1.w, paddle1.h);
    ctx.fillRect(paddle2.x, canvasHeight - paddle2.y - paddle2.h, paddle2.w, paddle2.h);
  }

  function renderObstacles() {
    ctx.fillStyle = 'white';
    for (var i = 0; i < obstacles.length; i++) {
      var obstacle = obstacles[i];
      ctx.fillRect(obstacle.x, canvasHeight - obstacle.y - obstacle.h, obstacle.w, obstacle.h);
    }
  }

  function renderBall() {
    ctx.fillStyle = 'white';
    ctx.fillRect(ball.x, canvasHeight - ball.y - ball.h, ball.w, ball.h);
  }

  function addY(obj, dy) {
    obj.y += dy;
    if (obj.y < 0) {
      obj.y = 0;
    }
    if (obj.y + obj.h> canvasHeight) {
      obj.y = canvasHeight - obj.h;
    }
  }

  function getNormalizedIntersectY(ref, other) {
    var rcy = ref.y + ref.h / 2;
    var ocy = other.y + other.h / 2;
    var intersectY = ocy - rcy;
    var normalizedIntersectY = 2 * intersectY / (ref.h + other.h);
    return normalizedIntersectY;
  }

  function update(dt) {
    ball.x += ball.dx * dt;
    ball.y += ball.dy * dt;

    if (ball.y < 0 || canvasHeight < ball.y) {
      ball.dy = - ball.dy;
    }

    if (ball.x < 0) {
      paddle2.score++;
      resetBall();
    }

    if (canvasWidth < ball.x) {
      paddle1.score++;
      resetBall();
    }

    if (keyboard.Z) {
      addY(paddle1, paddle1.dy * dt);
    }
    if (keyboard.S) {
      addY(paddle1, -paddle1.dy * dt);
    }
    if (keyboard.up) {
      addY(paddle2, paddle2.dy * dt);
    }
    if (keyboard.down) {
      addY(paddle2, -paddle2.dy * dt);
    }

    for (var i = 0; i < obstacles.length; i++) {
      var obstacle = obstacles[i];

      if (Utils.overlap(ball, obstacle)) {
        // from where?
        var _2PI = 2 * Math.PI;
        var cornerAngle = (Math.atan2(obstacle.h, obstacle.w) + _2PI) % _2PI;
        var angle = (Math.atan2(ball.cy - obstacle.cy, ball.cx - obstacle.cx) + _2PI) % _2PI;

        if (angle < cornerAngle || 2 * Math.PI - cornerAngle <= angle) {
          // right
          ball.dx = -ball.dx;
          ball.x = obstacle.x + obstacle.w + 1;
        }
        else if (angle < Math.PI - cornerAngle) {
          //top
          ball.dy = -ball.dy;
          ball.y = obstacle.y + obstacle.h + 1;
        }
        else if (angle < Math.PI + cornerAngle) {
          // left
          ball.dx = -ball.dx;
          ball.x = obstacle.x - ball.w - 1;
        }
        else if (angle < 2 * Math.PI - cornerAngle) {
          // bottom
          ball.dy = -ball.dy;
          ball.y = obstacle.y - ball.h - 1;
        }

        bounceObstacle.play();
      }
    }

    if (ball.dx < 0 && Utils.overlap(ball, paddle1)) {
      ball.dx = -ball.dx;
      var intersectY = getNormalizedIntersectY(paddle1, ball);
      var angle = intersectY * Math.PI / 4;
      ball.v += 10;
      setAngle(ball, angle);
      bouncePaddle.play();
      addObstacle();
    }
    if (ball.dx > 0 && Utils.overlap(ball, paddle2)) {
      ball.dx = -ball.dx;
      var intersectY = getNormalizedIntersectY(paddle2, ball);
      var angle = Math.PI - intersectY * Math.PI / 4;
      ball.v += 10;
      setAngle(ball, angle);
      bouncePaddle.play();
      addObstacle();
    }
  }

  var updateResolution = 20/1000; // seconds
  Utils.loop(function main(dt) {
    // multiple micro updates
    while (dt > updateResolution) {
      update(updateResolution);
      dt -= updateResolution;
    }
    update(dt);
    Utils.clear(ctx);
    render();
  });

});
