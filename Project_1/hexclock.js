/* global document */
var canvas = document.getElementById("plot1");
canvas.width = document.getElementById("plot1").clientWidth;
canvas.height = document.getElementById("plot1").clientHeight;

//sets up context
var ctx = canvas.getContext("2d");
var radius = (canvas.width) * 0.2;
ctx.lineWidth = 2;
ctx.translate(canvas.width/2, canvas.height/2);
ctx.moveTo(0,0);
var t = 0;

//this method draws a spirogram, circling every second, and completing a full cycle every minute
function updateTime(){
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    
    //adjusts time in hex to scale out of rgb 255
    var hexHour = (Math.round(parseInt(hour)*255/23)).toString(16);
    var hexMin = (Math.round(parseInt(minute)*255/60)).toString(16);
    var hexSec = (Math.round(parseInt(second)*255/60)).toString(16);
    if(hexHour.length==1)
        hexHour = "0"+hexHour;
    if(hexMin.length==1)
        hexMin = "0"+hexMin;
    if(hexSec.length==1)
        hexSec = "0"+hexSec;
    
    //displays time at top of screen for reference. this is not always necessary
    ctx.fillStyle = "white";
    ctx.fillRect(-canvas.width/2, -canvas.height/2, 200, 50)
    ctx.font="20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(hour+":"+minute+":"+second,-canvas.width/2, -canvas.height/2+20);
    ctx.fillText(hexHour+":"+hexMin+":"+hexSec,-canvas.width/2, -canvas.height/2+50);
    
    //interval updates every 10ms, so interval * 50 gives us a circle drawn every second, a timer of itself
    var interval = Math.PI/50

    //sets the color of the path to the hex code corresponding to the time
    //this produces a gradient representing the clow of time
    ctx.strokeStyle = "#"+hexHour+hexMin+hexSec;
    ctx.beginPath();
    ctx.moveTo((Math.cos(t)+Math.cos(t/60))*radius, (Math.sin(t)+Math.sin(t/60))*radius);
    t+=interval;
    ctx.lineTo((Math.cos(t)+Math.cos(t/60))*radius, (Math.sin(t)+Math.sin(t/60))*radius);
    ctx.stroke();
    ctx.closePath; 
}

setInterval(updateTime, 10);
     
