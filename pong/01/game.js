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

  var bounce = Utils.makeSound(["square",0,0.201,0,0.106,0,0.026,20,223,24,0,0,0,0.01,0.0003,0,0,0,0.5,0,0,0,0,1,0,0,0.1,0]);

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
    dx : 200,
    dy : 0
  });
  resetBall();


  function resetBall() {
    ball.center(canvasWidth / 2, canvasHeight / 2);
    var angle = Utils.random.float(-Math.PI / 3, Math.PI / 3) + Utils.random.choice(0, Math.PI);
    setAngle(ball, angle);
  }

  function setAngle(obj, angle) {
    obj.dx = 200 * Math.cos(angle);
    obj.dy = 200 * Math.sin(angle);
  }

  function f(x) {
    return Math.floor(x);
  }

  function render() {
    renderUI();
    renderPaddles();
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

    if (ball.dx < 0 && Utils.overlap(ball, paddle1)) {
      ball.dx = -ball.dx;
      var intersectY = getNormalizedIntersectY(paddle1, ball);
      var angle = intersectY * Math.PI / 4;
      setAngle(ball, angle);
      bounce.play();
    }
    if (ball.dx > 0 && Utils.overlap(ball, paddle2)) {
      ball.dx = -ball.dx;
      var intersectY = getNormalizedIntersectY(paddle2, ball);
      var angle = Math.PI - intersectY * Math.PI / 4;
      setAngle(ball, angle);
      bounce.play();
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
