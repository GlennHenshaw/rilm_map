const margin = {top:30, right:0, bottom:20, left:0};

const colors = ['#E04836','#F39D41','#8D5924','#5696BC','#2F5168','#FFFFFF'];

const max_width = 1200;
const max_height = 800;

var width = Math.min(max_width,window.innerWidth) - margin.right - margin.left;
var height = Math.min(max_height,window.innerHeight)- margin.top - margin.bottom;


var g = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



var tooltip = d3.select("div.tooltip");

var projection, path;

var data = d3.map();
var names = d3.map();

var countries = g.append("g");

const logScale = d3.scaleLog()
      .domain([1, 300000]);

const colorScale = d3.scaleSequential((d) => d3.interpolateBlues(logScale(d))); 

var promises = [d3.json('./data/geojson_practice.json'),
                d3.csv('./data/accessions.csv',function(d) { 
                	data.set(d.code, +d.count); 
                	names.set(d.code, d.name)
                })];




var render = function(angle){

	projection = d3.geoOrthographic()
                   .rotate([angle,-10])
                   .scale(250)
                   .translate([width/2,height/2-50])
                   .precision(10)
                   .clipAngle(90);

    path = d3.geoPath().projection(projection);


    Promise.all(promises).then(function(allData){
   var topo = allData[0];
   var country_data = allData[1];
  
    d3.selectAll(".countries").remove();    
   
    countries.selectAll("path")
        .attr("class", "countries")
        .data(topo.features)
        .enter().append("path")
            .attr("stroke","black")
            .attr("fill", function (d){
                // Pull data for this country
                d.count = data.get(d.id) || 0;
                d.name = names.get(d.id) || 0;
                // Set the color
                return colorScale(d.count);
            })
            .attr("d", path)
            .on("mouseover",function(d,i){
                d3.select(this).attr("stroke-width",2);
                return tooltip.style("hidden", false).html(d.name + "<br>" + d.count );
            })
            .on("mousemove",function(d){
                tooltip.classed("hidden", false)
                       .style("top", (d3.event.pageY) + "px")
                       .style("left", (d3.event.pageX + 10) + "px")
                       .html(d.name + "<br>" + d.count );
            })
            .on("mouseout",function(d,i){
                d3.select(this).attr("stroke","black").attr("stroke-width",1);
                tooltip.classed("hidden", true);
            });

     console.log(countries);

    make_legend();

   
     });


};



render(40);



d3.select("#rotation").on("input", function() {
	console.log(+this.value + 1000);
  	render(+this.value);
		});

var make_legend = function() {
    var legend = g.append("g")
               .attr("class", "key")
               .attr("transform", `translate(${width/2 - 50*2.5},${-10})`);


     var legend_data = [10,100,1000,10000,100000];
     var legend_text = ["10","100","1k","10k","100k"];

     legend.selectAll("rect")
           .data(legend_data)
           .enter()
           .append("rect")
           .attr("height", 20)
           .attr("x", (d,i) => 50*i)
           .attr("width", 50)
           .attr("fill", (d) => colorScale(d));

      legend.selectAll("text")
            .data(legend_text)
            .enter()
            .append("text")
            .attr("x", (d,i) => 50*i + 10)
            .attr("y", 15)
            .attr("fill", "#FFF")
            .attr("text-anchor", "center")
            .text((d) => d);


}











