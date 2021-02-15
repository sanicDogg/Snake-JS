window.onload = function() {
  document.addEventListener('keydown', changeDirection);
  setInterval(loop, 1000/60); // 60 FPS
}

var
  canv = document.getElementById('mc'), // canvas
  ctx = canv.getContext('2d'), // 2d context
  gs = fkp = false, // game started && first key pressed (initialization states)
  speed = baseSpeed = 3, // snake movement speed
  xv = yv = 0, // velocity (x & y)
  px = ~~(canv.width) / 2, // player X position
  py = ~~(canv.height) / 2, // player Y position
  pw = ph = 20, // player size
  aw = ah = 20, // apple size
  apples = [], // apples list
  trail = [], // tail elements list (aka trail)
  tail = 10, // tail size (1 for 10)
  tailSafeZone = 20, // self eating protection for head zone (aka safeZone)
  cooldown = false, // is key in cooldown mode
  score = 0; // current score

// game main loop
function loop()
{
  var showScore = document.getElementById("Score");
  showScore.innerHTML = score;

  // logic
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canv.width, canv.height);

  // force speed
  px += xv;
  py += yv;

  // teleports
  if (px > canv.width)
    {px = 0;}

  if (px + pw < 0)
    {px = canv.width;}

  if (py + ph < 0)
    {py = canv.height;}

  if (py > canv.height)
    {py = 0;}

  // paint the snake itself with the tail elements
  ctx.fillStyle = 'lime';

  trail.forEach((item) => {
    ctx.fillStyle = item.color || 'lime';
    ctx.fillRect(item.x, item.y, pw, ph);
  });


  trail.push({x: px, y: py, color: ctx.fillStyle});

  // limiter
  if (trail.length > tail)
  {
    trail.shift();
  }

  // eaten
  if (trail.length > tail)
  {
    trail.shift();
  }

  // self collisions
  if (trail.length >= tail && gs)
  {
    for (let i = trail.length - tailSafeZone; i >= 0; i--)
    {
      if (
        px < (trail[i].x + pw)
        && px + pw > trail[i].x
        && py < (trail[i].y + ph)
        && py + ph > trail[i].y
      )
      {
        // got collision
        tail = 10; // cut the tail
        speed = baseSpeed; // cut the speed
        score = 0; // cut the score

        for (let t = 0; t < trail.length; t++)
        {
          // highlight lossed area
          trail[t].color = 'red';

          if (t >= trail.length - tail)
            break;
        }
      }
    }
  }

  // paint apples
  apples.forEach((apple, i) => {
    ctx.fillStyle = apple.color;
    ctx.fillRect(apple.x, apple.y, aw, ah);
  });

  // check for snake head collisions with apples
  apples.forEach((apple, i) => {
    if (
         px < (apple.x + pw)
      && px + pw > apple.x
      && py < (apple.y + ph)
      && py + ph > apple.y
    ) {
      // got collision with apple
      apples.splice(i, 1); // remove this apple from the apples list
      tail += 10; // add tail length
      speed += 0.1; // add some speed
      score++; // increment Score
      spawnApple(); // spawn another apple(-s)
    }
  });


}

// apples spawner
function spawnApple()
{
  var
    newApple = {
      x: ~~(Math.random() * canv.width),
      y: ~~(Math.random() * canv.height),
      color: 'red'
    };

  // forbid to spawn near the edges
  if (
    (newApple.x < aw || newApple.x > canv.width - aw)
    ||
    (newApple.y < ah || newApple.y > canv.height - ah)
  )
  {
    spawnApple();
    return;
  }

  // check for collisions with tail element, so no apple will be spawned in it
  for (var i = 0; i < tail.length; i++)
  {
    if (
         newApple.x < (trail[i].x + pw)
      && newApple.x + aw > trail[i].x
      && newApple.y < (trail[i].y + ph)
      && newApple.y + ah > trail[i].y
    )
    {
      // got collision
      spawnApple();
      return;
    }
  }

  apples.push(newApple);

  if (apples.length < 3 && ~~(Math.random() * 1000) > 700)
  {
    // 30% chance to spawn one more apple
    spawnApple();
  }
}

// velocity changer (controls)
function changeDirection(evt)
{
  if (!fkp && [37,38,39,40].indexOf(evt.keyCode) > -1)
  {
    setTimeout(function() {gs = true;}, 1000);
    fkp = true;
    spawnApple();
  }

  if (cooldown)
    return false;

  /*
    4 directional movement.
   */
  if (evt.keyCode == 37 && !(xv > 0)) // left arrow
    {xv = -speed; yv = 0;}

  if (evt.keyCode == 38 && !(yv > 0)) // top arrow
    {xv = 0; yv = -speed;}

  if (evt.keyCode == 39 && !(xv < 0)) // right arrow
    {xv = speed; yv = 0;}

  if( evt.keyCode == 40 && !(yv < 0) ) // down arrow
    {xv = 0; yv = speed;}

  cooldown = true;
  setTimeout(function() {cooldown = false;}, 100);
}
