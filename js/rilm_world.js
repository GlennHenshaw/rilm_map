const margin = {top:20, right:10, bottom:50, left:150};

const colors = ['#E04836','#F39D41','#8D5924','#5696BC','#2F5168','#FFFFFF'];

const max_width = 800;
const max_height = 500;

var width = Math.min(max_width,window.innerWidth) - margin.right - margin.left;
var height = Math.min(max_height,window.innerHeight)- margin.top - margin.bottom;


var g = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Choropleth map: different colors for different regions on a map


var projection = d3.geoMercator()
    .scale(100)
    .translate([width/2,height/2 - 100])
    .precision(.1);


var path = d3.geoPath()
             .projection(projection);

var colorScheme = d3.schemeReds[6];

colorScheme.unshift("#eee")

var colorScale = d3.scaleThreshold()
    .domain([0,1312978855])
    .range(colorScheme);             

var graticule = d3.geoGraticule();

var accessions = d3.map();

var promises = [d3.json('./data/world-110m.json'),
                d3.csv('./data/country_data.csv',function(d) { 
                  accessions.set(d.code, +d.pop);
                })];




Promise.all(promises).then(function(allData){
   var world = allData[0];
   var data = allData[1];

   console.log(accessions);

   


   g.append("path")
    .datum(topojson.feature(world,world.objects.land))
    .attr("class","land")
    .attr("d",path);

   g.append("path")
    .datum(topojson.mesh(world,world.objects.countries, function(a,b){
      return a !== b;}))
    .attr("class","boundary")
    .attr('d',path);

   g.append("path")
    .datum(graticule)
    .attr("class","graticule")
    .attr("d",path);

   g.append("g")
    .attr("class","countries")
    .selectAll("path")
    .data(topojson.feature(world, world.objects.countries).features)
    .enter()
    .append("path")
    .attr("fill", (d,i) => {
      d.pop = accessions.get(d.id) || 0;
      colorScale(d.pop);})
    .attr("d",path);







    console.log(topojson.feature(world, world.objects.countries).features.properties)




});