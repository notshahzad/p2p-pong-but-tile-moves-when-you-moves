var h = 600;
var w = 1200;
var sum;
var pos;
video = document.getElementById("video");
video.height = 500;
video.width = 500;
app = new PIXI.Application({ height: h, width: w });
function VideoStream() {
  var facingMode = "user";
  var constraints = {
    audio: false,
    video: { facingMode: facingMode },
  };
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
  });
  video.play();
  posenet();
}
function posenet() {
  var poseNet = ml5.poseNet(video, { flipHorizontal: true });
  poseNet.on("pose", (results) => {
    try {
      sum = parseInt(results[0]["pose"]["nose"]["x"]);
      sum = scale(sum, 0, 500, 0, 1100);
    } catch {
      console.log("player not in camera or smth");
    }
    if (results != undefined && sum != undefined && results.length != 0) {
      if (results[0].pose.score > 0.3) {
        try {
          dc.send(["tileposition", sum]);
        } catch {}
        UpdateSelfTilePosition(sum);
      }
    }
  });
}

document.body.appendChild(app.view);
ball = new PIXI.Graphics();
tile = new PIXI.Graphics();
tile2 = new PIXI.Graphics();

function UpdateSelfTilePosition(new_position) {
  selfpos = initer ? h - 50 - 20 : 50;
  tile.clear();
  tile.beginFill(0xffffff);
  tile.lineStyle(1, 0);
  tile.drawRect(new_position, selfpos, 50, 20);
  app.stage.addChild(tile);
}
function UpdateOtherTilePosition(new_position) {
  pos = initer ? 50 : h - 50 - 20;
  tile2.clear();
  tile2.beginFill(0xffffff);
  tile2.lineStyle(1, 0);
  tile2.drawRect(new_position, pos, 50, 20);
  app.stage.addChild(tile2);
}
function scale(number, inMin, inMax, outMin, outMax) {
  return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
document.addEventListener("keydown", (key) => {
  if (key.key == " ") startgame();
});
function startgame() {
  if (initer) {
    genrateball(w / 2, h / 2, 1, 1);
  }
}
function genrateball(initialposx, initialposy, speedx, speedy) {
  app.ticker.add(() => {
    if (initer && initialposy >= 300) {
      initialposy += speedy;
      initialposx += speedx;
      updateball(initialposx, initialposy);
      //if initer tile niche
      if (initialposx > sum && initialposx < sum + 50)
        console.log("same x axis");
      if (
        initialposx > sum &&
        initialposx < sum + 50 &&
        initialposy + 10 == selfpos
      )
        speedy *= -1;
      dc.send(["ballposition", initialposx, initialposy, speedx, speedy]);
    }
    if (initialposy >= h - 10 || initialposy == 0) speedy *= -1;
    if (initialposx >= w - 10 || initialposx <= 0) speedx *= -1;
    if (!initer && initialposy <= 300) {
      console.log(initialposx, sum);
      initialposy += speedy;
      initialposx += speedx;
      updateball(initialposx, initialposy);
      if (initialposx > sum && initialposx < sum + 50)
        console.log("same x Axies", initialposy, selfpos);
      if (
        initialposx > sum &&
        initialposx < sum + 50 &&
        initialposy == selfpos + 20
      )
        speedy *= -1;
      dc.send(["ballposition", initialposx, initialposy, speedx, speedy]);
    }
  });

  // speedx = speedy = 1;
  // if(initer == false){
  //   speedx = speedy *= -1
  // }
  // ballhw = 10;       //more like square
  //  app.ticker.add(()=>{
  //    updateball(position_x,position_y)
  //    if(position_y < ) position_x+=speedx,position_y+=speedy;
  // })
}
function updateball(position_x, position_y) {
  ball.clear();
  ball.beginFill(0xffffff);
  ball.lineStyle(1, 0);
  ball.drawRect(position_x, position_y, 10, 10);
  app.stage.addChild(ball);
}
function rsdata() {
  dc.onmessage = (e) => {
    data = e.data.split(",");
    if (data[0] == "ballposition") {
      if (eval(data[2]) <= 300) {
        genrateball(eval(data[1]), eval(data[2]), eval(data[3]), eval(data[4]));
      }
      updateball(eval(data[1]), eval(data[2]));
    }
    if (data[0] == "tileposition") {
      UpdateOtherTilePosition(data[1]);
    }
  };
}
