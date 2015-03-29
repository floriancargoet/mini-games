var Utils = (function () {

  function onReady(fn) {
    document.addEventListener('DOMContentLoaded', fn, false);
  }

  function keyboard(keys) {
    var kb = {};
    document.addEventListener('keydown', function onKeyDown(ev) {
      var key = keys[ev.which];
      if (key) {
        kb[key] = true;
        return cancelEvent(ev);
      }
    }, false);

    document.addEventListener('keyup', function onKeyUp(ev) {
      var key = keys[ev.which];
      if (key) {
        kb[key] = false;
        return cancelEvent(ev);
      }
    }, false);

    return kb;
  }


  function loop(fn) {
    var now = Date.now();
    var lastTime = now;
    var i = 0;
    function frame() {
      now = Date.now();
      fn((now - lastTime) / 1000);
      lastTime = now;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function cancelEvent(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    return false;
  }

  function printCenteredText(ctx, text, x, y) {
    ctx.fillStyle = 'white';
    var height = 30;
    ctx.font = height + 'px sans-serif';
    var width = ctx.measureText(text).width;
    ctx.fillText(text, x - width / 2, ctx.canvas.height - y + height / 2);
  }

  function overlap(a, b) {
    if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h) {
      return b.y < a.y + a.h;
    } else {
      return false;
    }
  }

  function clear(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.canvasWidth, ctx.canvas.canvasHeight);
  }

  function randFloat(m, n) {
    return m + (n - m) * Math.random();
  }

  function randInt(m, n) {
    return m + Math.floor((n - m) * Math.random());
  }

  function randChoice() {
    return arguments[randInt(0, arguments.length)];
  }

  function getters(Class, _getters) {
    for (var prop in _getters) {
      Object.defineProperty(Class.prototype, prop, {
        get: _getters[prop]
      });
    }
  }

  function Rect(config) {
    for (var key in config) {
      this[key] = config[key];
    }
  }
  getters(Rect, {
    cx : function () {
      return this.x + this.w / 2;
    },
    cy : function () {
      return this.y + this.h / 2;
    }
  });

  Rect.prototype.center = function (x, y) {
    this.x = x - this.w / 2;
    this.y = y - this.h / 2;
  };

  return {
    loop: loop,
    clear: clear,
    onReady: onReady,
    overlap: overlap,
    keyboard: keyboard,
    cancelEvent: cancelEvent,
    printCenteredText: printCenteredText,
    random: {
      int: randInt,
      float: randFloat,
      choice: randChoice
    },
    Rect : Rect
  };
})();