/* global document */
var canvas3 = document.getElementById("plot3");
canvas3.width = document.getElementById("plot3").clientWidth;
canvas3.height = document.getElementById("plot3").clientHeight;
var ctx3 = canvas3.getContext("2d");

//creates background gradient
var grad = ctx3.createRadialGradient(canvas3.width/2, canvas3.height/2, 0,canvas3.width/2, canvas3.height/2, canvas3.height/2);
grad.addColorStop(0,"black");
grad.addColorStop(1,"#333333");
ctx3.fillStyle = grad;
ctx3.fillRect(0, 0, canvas3.width, canvas3.height);

ctx3.translate(canvas3.width/2, canvas3.height/2)

//draws hands of clock as darts against background
//does not yet update via time, this requires converting time into an angle
function drawHand(angle, radius){
    ctx3.beginPath();
    ctx3.strokeStyle = "white";
    ctx3.fillStyle = "white";
    ctx3.lineTo(10*Math.sin(angle), 10*Math.cos(angle));
    ctx3.lineTo(radius*Math.cos(angle), radius*Math.sin(angle));
    ctx3.lineTo(-10*Math.sin(angle), 10*Math.cos(angle));
    ctx3.lineTo(10*Math.sin(angle), 10*Math.cos(angle));
    ctx3.stroke();
    ctx3.fill();
    ctx3.closePath();
}

drawHand((-1)*Math.PI/3, 200);
drawHand((1)*Math.PI/4, 100);