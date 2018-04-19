

var slide_x_max = d3.scaleLinear()
    .domain([minimum, maximum])
    .rangeRound([0, width])
    .clamp(true);

var svg_max = d3.select(".slideMax")
    .attr('width', width + margin * 3)
    .attr('height', height + margin);


var slider_max = svg_max.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + margin + "," + 10 + ")");

slider_max.append("line")
    .attr("class", "track")
    .attr("x1", slide_x_max.range()[0])
    .attr("x2", slide_x_max.range()[1])
    .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")


selected_line = slider_max.append("line")
    .attr("class", "track-selected")
    .attr("x1", slide_x_max(minimum))
    .attr("x2", slide_x_max(maximum))


var handle_min = slider_max.insert("g", ".track-overlay")
    .attr("transform", "translate(" + 0 + "," + 0 + ")")
    .call(d3.drag()
        .on("start.interrupt", function () { slider.interrupt(); })
        .on("start drag", function () { hueMin(slide_x_max.invert(d3.event.x)); }));

handle_min.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);
handle_min.append("text")
    .attr("class", "ticks")
    .text(formatCount(minimum))
    .attr("transform", "translate(" + -getWidthTick(minimum) / 2 + "," + 20 + ")");

var handle_max = slider_max.insert("g", ".track-overlay")
    .attr("transform", "translate(" + slide_x_max(maximum) + "," + 0 + ")")
    .call(d3.drag()
        .on("start.interrupt", function () { slider.interrupt(); })
        .on("start drag", function () { hueMax(slide_x_max.invert(d3.event.x)); }));

handle_max.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);
handle_max.append("text")
    .attr("class", "ticks")
    .text(formatCount(maximum))
    .attr("transform", "translate(" + -getWidthTick(maximum) / 2 + "," + 20 + ")");


