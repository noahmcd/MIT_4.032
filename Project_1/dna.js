/* global document */
var canvas2 = document.getElementById("plot2");
canvas2.width = document.getElementById("plot2").clientWidth;
canvas2.height = document.getElementById("plot2").clientHeight;

var ctx2 = canvas2.getContext("2d");
ctx2.save();

//this function will update a strand of DNA, where 3 bases respresents the hour, minute, and second
function updateTime(){
    ctx2.restore();
    
    var now = new Date();
    var hour = dna(now.getHours());
    var minute = dna(now.getMinutes());
    var second = dna(now.getSeconds());
    var time = hour+minute+second;
    
    //draw all 9 bases representing time going down the strand
    for(var i=0; i<9; i++){
        if(i==0)
           ctx2.translate(80, canvas2.height/6); 
        else
            ctx2.translate(0, canvas2.height/12);
        drawBase(time, i);
 
    }
}

//converts a numerical time into base 4, then DNA bases
function dna(num){
    var out = "";
    num = num.toString(4);
    while(num.length<3)
        num = "0"+num;
    for(var i=0; i<num.length; i++){
        switch(num.charAt(i)){
            case '0':
                out+='A';
                //set fillstyle here?
                break;
            case '1':
                out+='T';
                break;
            case '2':
                out+='G';
                break;
            case '3':
                out+='C';
                break;
        }
    }
    return out;
}

//draws backbone of DNA
function drawStrand(){
    ctx2.fillStyle = "#4c5970";
    ctx2.fillRect(60,(canvas2.height)/12, 20, (canvas2.height)*10/12);
}

//draws a base, each color representing adifferent base, specified by an input text of 9 bases
function drawBase(t, index){
    var  letter = t.charAt(index);
    switch(letter){
        case 'A':
            ctx2.fillStyle = "green";
            break;
        case 'T':
            ctx2.fillStyle = "blue";
            break;
        case 'G':
            ctx2.fillStyle = "red";
            break;
        case 'C':
            ctx2.fillStyle = "purple";
            break;
    }
    ctx2.fillRect(0, 0, 80, 20);
    
    ctx2.fillStyle = "Black";
    ctx2.font="20px Arial";
    ctx2.fillText(letter, 80, 20);
}


drawStrand();
updateTime();
