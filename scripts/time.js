var margin = {top: 10, right: 10, bottom: 100, left: 40},
    margin2 = {top: 330, right: 10, bottom: 20, left: 40},
    width = 800,
    height = 400 - margin.top - margin.bottom,
    height2 = 400 - margin2.top - margin2.bottom;

var x = d3.time.scale().range([0, width]),
    x2 = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    y2 = d3.scale.linear().range([height2, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom"),
    xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).orient("left");

var brush = d3.svg.brush()
    .x(x2)
    .on("brush", brushed);

var area = d3.svg.area()
    .interpolate("interpolate")
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.goldstein); });

var trend = d3.svg.area()
    .interpolate("interpolate")
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.goldstein); });

var area2 = d3.svg.area()
    .interpolate("interpolate")
    .x(function(d) { return x2(d.date); })
    .y0(height2)
    .y1(function(d) { return y2(d.goldstein); });

var svg = d3.select("#time-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

queue()

    .defer(d3.csv, "data/goldstein/averag.dat")
    .defer(d3.csv, "data/goldstein/markov.dat")
    .await(function(error, points, trends) {

        var timeSeries = points.map(function(d){
            d.date = new Date(d.date * 1000);
            d.goldstein = +d.goldstein;
            return d;
        });

        var trendSeries = trends.map(function(d){
            d.date = new Date(d.date * 1000);
            d.goldstein = +d.goldstein;
            return d;
        });

        var minY = d3.min(timeSeries.map(function(d) { return d.goldstein; })) - 1;
        var maxY = d3.max(timeSeries.map(function(d) { return d.goldstein; })) + 1;
        x.domain(d3.extent(timeSeries.map(function(d) { return d.date; })));

        y.domain([minY, maxY]);
        x2.domain(x.domain());
        y2.domain(y.domain());

        focus.append("path")
            .datum(timeSeries)
            .attr("class", "area")
            .attr("d", area);

        focus.append("path")
            .datum(trendSeries)
            .attr("class", "trend")
            .attr("d", trend);

        focus.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        context.append("path")
            .datum(timeSeries)
            .attr("class", "area")
            .attr("d", area2);

        context.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", height2 + 7);

    });

function brushed() {
    x.domain(brush.empty() ? x2.domain() : brush.extent());
    focus.select(".area").attr("d", area);
    focus.select(".trend").attr("d", trend);
    focus.select(".point").attr("d", trend);
    focus.select(".x.axis").call(xAxis);
}
