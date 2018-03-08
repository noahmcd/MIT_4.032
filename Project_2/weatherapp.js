//build margins for svg window, as the DOM element to build the visualization in
var margin = {top: 50, bottom: 20, left: 60, right: 0};
var width = d3.select('#vis1').node().clientWidth - margin.right - margin.left;
var height = d3.select('#vis1').node().clientHeight - margin.top - margin.bottom;

var plot = d3.select("#plot1").append('svg')
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom);

//Credit to anon in Piazza for th efollowing section of code
$.ajax({
  url: 'https://api.darksky.net/forecast/4c2574cbcf4dfd15cc2ced1a86941144/42.378369,-71.1829495',
  dataType: 'JSONP',
  type: 'GET',
  crossDomain: true,
  complete: function (data) {
    if (data.readyState == '4' && data.status == '200') {
        draw(data);
        draw2(data);
    } else {
      console.log("DATA FETCH FAILED")
    }
  }
}) //end section


//draws a graph of outdoor comfort
function draw(data){
    console.log(data); 
    //shortens dataset to the next 9 hours
    var dataHours = data.responseJSON["hourly"]["data"].slice(0, 8);
       
    //make scales
    var x = d3.scaleTime()
        .domain(d3.extent(dataHours, function(d){return new Date (d.time * 1000)}))
        .range([0,width-margin.right-margin.left]);
    var y = d3.scaleLinear()
        .domain(d3.extent(dataHours,function(d){return PMV(d)}))
        .range([height-margin.top-margin.bottom, height/2]);
    
    var line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function(d) { return x(new Date (d.time * 1000)); })
        .y(function(d) { return y(PMV(d)); });

    //x axis
    plot.append("g")
        .attr("class", "axis axis-x")
        //.attr("transform", "translate("+margin.left + "," + height+margin.top + ")")
        .attr("transform", "translate(" + margin.left + "," + (height-margin.bottom) + ")")
        .call(d3.axisBottom(x).ticks(5));
        //.text("Time");
    
    //y axis
    plot.append("g")
        .attr("class", "axis axis-y")
        .attr("transform", "translate(" + margin.left + "," +  margin.top + ")")
        .call(d3.axisLeft(y).ticks(5))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0-margin.top)
        .attr("x", 0-height*3/4+margin.left)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .attr("stroke", "black")
        .text("Outdoor Comfort (PMV)");
    
    //data path
    plot.append("path")
        .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")
        //.datum(dataHours)
        .attr("class", "line")
        .attr("d", line(dataHours));
    
    //ccalculates time and value of maximum outdoor conditions
    var cond = "";
    var maxPMV = d3.max(dataHours,function(d){return PMV(d)});
    var maxTime = d3.max(dataHours,function(d){return new Date(d.time * 1000).getHours()});
    if(maxTime>12)
        maxTime-=12;
   
    //sets a word value for PMV
    switch(true){
        case maxPMV>400:
            cond = "Pleasant";
            break;
        case inRange(maxPMV, 350, 400):
            cond = "Fair";
            break;
        case inRange(maxPMV, 300, 350):
            cond = "Poor";
            break;
        case maxPMV<300:
            cond = "Unpleasant";
            break;   
    }
    
    //insert values into paragraph section
    d3.select("#condition")
        .append("text")
        .text(cond);
    
    d3.select("#time")
        .append("text")
        .text(maxTime);
    
}

function inRange(num, low, hi){
    if(num>=low && num<hi)
        return true;
}
  
function PMV(data){
    var e = 2.718;
    var M = 115;
    var pa = data["pressure"]*0.1;
    var temp = (data["temperature"]-32)*5/9;
    var tr = (2*data["apparentTemperature"]-32)*5/9-temp;
    var v = data["windSpeed"]*0.44704;

    var fcl = 1;
    var icl = 1;
    var hc = 12.1*Math.pow(v, .5);
    var rcl = 0.155*icl;
    var tcl = 35.7-0.0275*M-rcl*(M-3.05*(5.73-.007*M)-pa)-.42*(M-58.15)-.0173*(5.87-pa)-.0014*(34-temp);

    var PMV = (.303*Math.pow(e, (-1)*.036*M)+.028)*M-3.96*.00000001*fcl*(Math.pow(tcl+273, 4)-Math.pow(tr+273, 4))-fcl*hc*(tcl-temp)-3.05*(5.73-.007*M-pa)-.042*(M-58.15)-.0173*M*(5.87-pa)-.0014*M*(34-temp);
    
    return PMV;
}


//////////////////
//    PLOT 2    //

var margin2 = {top: 100, bottom: 50, left: 20, right: 20};
var width2 = d3.select('#vis2').node().clientWidth - margin2.right - margin2.left;
var height2 = d3.select('#vis2').node().clientHeight - margin2.top - margin2.bottom;

var plot2 = d3.select("#plot2").append('svg')
            .attr("width", width2 + margin2.right + margin2.left)
            .attr("height", height2 + margin2.top + margin2.bottom);

var defs = plot2.append("defs");

/*var linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");

linearGradient.append("stop")
   .attr('class', 'start')
   .attr("offset", "0%")
   .attr("stop-color", "blue")
   .attr("stop-opacity", .8);

linearGradient.append("stop")
   .attr('class', 'end')
   .attr("offset", "100%")
   .attr("stop-color", "red")
   .attr("stop-opacity", .8);

var colorScale = d3.scaleLinear()
    .domain(d3.extent(dataset, function(d){return d.temp}))
    .range(d3.extent(linearGradient, function(d){return d}));*/

var RB = d3.interpolateRdBu;
var colorScale = d3.scaleSequential(RB)
    .domain([100, 0]);

function draw2(data){
    //shortens dataset to the next 9 hours
    var dataset = data.responseJSON["hourly"]["data"];
    var cellX = width2/4; 
    var cellY = height2/12; 
    
    //var maxTemp = d3.max(dataset,function(d){return d.temp});
    //var minTemp = d3.min(dataset,function(d){return d.temp});
    var maxPrecip = d3.max(dataset,function(d){return d.precipIntensity});
    
    for(var row=0; row<12; row++)
        for(var col=0; col<4; col++){
            var datum =dataset[col*(row+1)];
            console.log(datum.tempertature);
            plot2.append("circle")
                .attr("transform", "translate(" + margin2.left + "," +  margin2.top + ")")
                .attr("cx", (col*cellX)+cellX/2)
                .attr("cy", (row*cellY)+cellY/2)
                .attr("r", .2*cellY*(1+datum.precipIntensity/maxPrecip))
                .attr("fill", colorScale(datum.temperature));
        }
}