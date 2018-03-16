//build margins for svg window, as the DOM element to build the visualization in
var margin = {top: 50, bottom: 20, left: 60, right: 0};
var width = d3.select('#vis1').node().clientWidth - margin.right - margin.left;
var height = d3.select('#vis1').node().clientHeight - margin.top - margin.bottom;

var plot = d3.select("#plot1").append('svg')
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom);

//Credit to anon in Piazza for the following section of code
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
       
    
    //background color gradient, scaled by temperature
    var rb = d3.interpolateRdBu;
    var colorScale = d3.scaleSequential(rb)
        .domain([90, 0]);
   
    var gradient = plot.append("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "50%")
        .attr("y1", "0%")
        .attr("x2", "50%")
        .attr("y2", "100%")
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorScale(d3.max(dataHours, function(d){return d.temperature})))
        .attr("stop-opacity", .5);
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorScale(d3.min(dataHours, function(d){return d.temperature})))
        .attr("stop-opacity", .5);

    plot.append("rect")
        .attr("width", width+margin.left+margin.right)
        .attr("height", height+margin.top+margin.bottom)
        .style("fill", "url(#gradient)");
    
    
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
    //y axis title
    plot.append("g")
        .attr("transform", "translate(" + margin.left + "," +  margin.top + ")")
        .append("text")
        .attr("class", "graphtitle")
        .attr("y", height/2-margin.top/2)
        .attr("x", 0)
        .text("Outdoor Comfort (PMV)");
    
    //data path
    plot.append("path")
        .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")")
        //.datum(dataHours)
        .attr("class", "line")
        .attr("d", line(dataHours));
    
    //calculates time and value of maximum outdoor conditions
    var cond = "";

    var maxPMV = -1;
    var maxTime = -1;
    for(var i=0; i<dataHours.length; i++)
        if(PMV(dataHours[i])>maxPMV){
            maxPMV = PMV(dataHours[i]);
            maxTime = new Date(dataHours[i]["time"]*1000);
        }
           
   
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
    
    var formatTime = d3.timeFormat("%I %p");
    d3.select("#time")
        .append("text")
        .text(formatTime(maxTime));
}

//tests whether a value is in a range [n, m)
function inRange(num, low, hi){
    if(num>=low && num<hi)
        return true;
}

//calculates the comfortabbility outside, based on:
//https://sustainabilityworkshop.autodesk.com/buildings/human-thermal-comfort
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

//sets dimensions of svg window
var margin2 = {top: 100, bottom: 50, left: 20, right: 20};
var width2 = d3.select('#vis2').node().clientWidth - margin2.right - margin2.left;
var height2 = d3.select('#vis2').node().clientHeight - margin2.top - margin2.bottom;

var plot2 = d3.select("#plot2").append('svg')
            .attr("width", width2 + margin2.right + margin2.left)
            .attr("height", height2 + margin2.top + margin2.bottom);

//creates a scale from blue to red, which is used to assign colors to the visualization
var RB = d3.interpolateRdBu;
var colorScale2 = d3.scaleSequential(RB)
    .domain([100, 0]);

//draw the second visualization
function draw2(data){
    var dataset = data.responseJSON["hourly"]["data"];
    //dimensions for grid of 48 circles
    var cellX = width2/4; 
    var cellY = (height2-40)/12; 
    
    //var maxTemp = d3.max(dataset,function(d){return d.temp});
    //var minTemp = d3.min(dataset,function(d){return d.temp});
    var maxPrecip = d3.max(dataset,function(d){return d.precipIntensity});
    var maxWind = d3.max(dataset,function(d){return d.windSpeed});
    
    //iterates over each hour to display a grid of circles, where radius is dependent on precipitation and color on temperature.
    for(var row=0; row<12; row++)
        for(var col=0; col<4; col++){
            var datum =dataset[col*(row+1)];
            console.log(datum.tempertature);
            var cx = (col*cellX)+cellX/2+15;
            var cy = (row*cellY)+cellY/2+100;
            plot2.append("ellipse")
                .attr("transform", "translate(" + margin2.left + "," +  margin2.top + ")")
                .attr("cx", cx)
                .attr("cy", cy)
                .attr("transform", "rotate("+(datum.windBearing-90)+","+cx+","+cy+")")
                .attr("rx", .25*cellY*(1+datum.precipIntensity/maxPrecip))
                .attr("ry", .25*cellY*(1+datum.windSpeed/maxWind))
                .attr("fill", colorScale2(datum.temperature))
                .attr("stroke", "black")
                .attr("stroke-width", ".5");
        }
    
    //wind speed key
    plot2.append("g")
        .append("text")
        .attr("x", width2/4)
        .attr("y", height2+margin2.top)
        .text("Wind");
    plot2.append("line")
        .attr("x1", width2/4+10)
        .attr("y1", 720)
        .attr("x2", width2/4+30)
        .attr("y2", 695)
        .attr("stroke", "black");
    plot2.append("line")
        .attr("x1", width2/4+20)
        .attr("y1", 696)
        .attr("x2", width2/4+30)
        .attr("y2", 695)
        .attr("stroke", "black");
    plot2.append("line")
        .attr("x1", width2/4+30)
        .attr("y1", 705)
        .attr("x2", width2/4+30)
        .attr("y2", 695)
        .attr("stroke", "black");
    
    //temperature key
    var gradient2 = plot2.append("defs")
        .append("linearGradient")
        .attr("id", "gradient2")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
    gradient2.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", colorScale2(0))
        .attr("stop-opacity", 1);
    gradient2.append("stop")
        .attr("offset", "25%")
        .attr("stop-color", colorScale2(25))
        .attr("stop-opacity", 1);
    gradient2.append("stop")
        .attr("offset", "75%")
        .attr("stop-color", colorScale2(75))
        .attr("stop-opacity", 1);
    gradient2.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", colorScale2(100))
        .attr("stop-opacity", 1);
    
    plot2.append("g")
        .append("text")
        .attr("x", width2*3/4-margin2.left-margin2.right)
        .attr("y", height2+margin2.top)
        .text("Temperature");
    plot2.append("g")
        .append("text")
        .attr("x", width2/2+10)
        .attr("y", height2+margin2.top+20)
        .text("0");
    plot2.append("g")
        .append("text")
        .attr("x", width2*3/4+85)
        .attr("y", height2+margin2.top+20)
        .text("100");
    plot2.append("rect")
        .attr("x", width2/2+25)
        .attr("y", height2+margin2.top+10)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("width", 150)
        .attr("height", 10)
        .style("fill", "url(#gradient2)");  
}