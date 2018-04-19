

var class_name = '.graph'
var color = 'third'
var bin_size = 10
var scaleLog = false

var width_graph = parseInt(d3.select(".graphbox").style("width")) - margin * 3;
let graph = d3.select(class_name)
height = width_graph * 0.4 - margin * 2;

if (height > 300) {
    height = 300
}

graph.attr('width', width_graph + margin * 3)
    .attr('height', height + margin * 2)


function getWidth(t) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    ctx.font = 36 + " Open Sans";
    var w = ctx.measureText(t).width;
    return w
}

function getHeight(text) {
    return 10
}

var svg = d3.select(class_name),
    g = svg.append("g")
        .attr("transform", "translate(" + (margin + 20) + "," + margin + ")");

x = d3.scaleLinear()
    .domain([minimum, maximum])
    .range([0, width_graph])

x2 = d3.scaleLinear()
    .domain([minimum, maximum])

var bins = d3.histogram()
    .domain(x.domain())
    .thresholds([...Array(bin_size).keys()].map((x) => x2.invert(x / bin_size)))
    (data);

let narray = []
for (let i = 0; i < Math.round(maximum) + 1; i++) {
    narray.push(i)
}

let stack = d3.histogram()
    .domain(x.domain())
    .thresholds(narray)
    (data);
stack = stack.map((d) => {
    return d.length
})

var y = d3.scaleLinear()
    .domain([0, d3.max(bins, function (d) { return d.length; })])
    .range([height, 0]);


// gridlines in y axis function
function make_y_gridlines(y) {
    return d3.axisLeft(y)
        .ticks(5)
}

// add the Y gridlines
g.append("g")
    .attr("class", "grid")
    .call(make_y_gridlines(y)
        .tickSize(-width_graph)
        .tickFormat("")
    )

let body_graph = g.append("g").attr("class", "body_graph " + color)

g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .append("text")
    // .attr("transform", "rotate(-90)")
    .attr("x", width_graph)
    .attr("y", 20)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("fill", "black")
    .text("# of " + xaxis);


g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("transform", "translate(50, -20)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("fill", "black")
    .text("# of " + yaxis);


var mouseG = g.append("g")
    .attr("class", "mouse-over-effects");

mouseG.append("path") // this is the black vertical line to follow mouse
    .attr("class", "mouse-line")
    .style("opacity", "0");

var summary = mouseG.append("g")
    .attr("class", "mouse-summary")
    .attr("opacity", "0");

boxsize = 240

summary.append("rect")
    .attr("y", "-20px")
    .attr("x", (-boxsize / 2) + "px")
    .attr("width", boxsize + "px")
    .attr("height", "55px")
    .style("fill", "white")
    .style("stroke", "#e2e2e2")
    .style("opacity", "1");

summary.append("text")
    .attr("class", "xvalue")
    .attr("y", "15px")
    .style("font-size", "24px")
    .style("fill", "black")
    .text("5")

summary.append("text")
    .attr("class", "less")
    .attr("x", (-boxsize / 2 + 10) + "px")
    .attr("y", "0px")
    .style("font-size", "14px")
    .text("10 classes")


summary.append("text")
    .attr("x", "-5px")
    .attr("y", "0px")
    .style("font-size", "14px")
    .text("<=")

summary.append("text")
    .attr("class", "more")
    .attr("x", (-boxsize / 2 + 10) + "px")
    .attr("y", "20px")
    .style("font-size", "14px")
    .text("10 classes")


summary.append("text")
    .attr("x", "-5px")
    .attr("y", "20px")
    .style("font-size", "14px")
    .text(">")


mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
    .attr('width', width_graph) // can't catch mouse events on a g element
    .attr('height', height)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseout', function () { // on mouse out hide line, circles and text
        d3.select(".mouse-line")
            .style("opacity", "0");
        d3.selectAll(".mouse-summary")
            .style("opacity", "0");
    })
    .on('mouseover', function () { // on mouse in show line, circles and text
        d3.select(".mouse-line")
            .style("opacity", "1");
        d3.selectAll(".mouse-summary")
            .style("opacity", "1");
    })
    .on('mousemove', function () { // mouse moving over canvas
        var mouse = d3.mouse(this);
        d3.select(".mouse-line")
            .attr("d", function () {
                var d = "M" + mouse[0] + "," + height;
                d += " " + mouse[0] + "," + 0;
                return d;
            });


        x_sum = mouse[0] < boxsize / 2 ? boxsize / 2 : mouse[0]
        x_sum = x_sum > width_graph - boxsize / 2 ? width_graph - boxsize / 2 : x_sum
        d3.select(".mouse-summary")
            .attr("transform", "translate(" + x_sum + ",20)")

        let threshold = Math.round(x.invert(mouse[0])) - minimum
        let less = stack.slice(0, threshold + 1)
        less = less.length > 0 ? less.reduce((a, b) => { return a + b }) : 0
        let more = stack.slice(threshold + 1, stack.length)
        more = more.length > 0 ? more.reduce((a, b) => { return a + b }) : 0
        d3.select(".less")
            .text(formatCount(less) + " " + yaxis)
        d3.select(".more")
            .text(formatCount(more) + " " + yaxis)

        d3.select(".xvalue")
            .attr("x", 60 + (-getWidth(formatCount(x.invert(mouse[0]))) / 2) + "px")
            .text(formatCount(x.invert(mouse[0])))
    });

if (bins[1].length / bins[0].length < 0.1) {
    toggleScale()
} else {
    var now_data = data.filter((d) => {
        return d >= minimum && d <= maximum
    })
    update_graph(true)
}

function update_graph(animate) {

    document.getElementById("max").innerHTML = d3.format(",.0f")(d3.max(now_data))
    document.getElementById("min").innerHTML = d3.format(",.0f")(d3.min(now_data))
    document.getElementById("average").innerHTML = d3.format(",.2f")(d3.mean(now_data))
    document.getElementById("number_of_classes").innerHTML = d3.format(",.0f")(now_data.length)
    document.getElementById("number_of_other_classes").innerHTML = d3.format(",.0f")(data.length - now_data.length)

    var bins = d3.histogram()
        .domain(x.domain())
        .thresholds([...Array(bin_size).keys()].map((x) => x2.invert(x / bin_size)))
        (now_data);

    narray = []
    for (let i = 0; i <= Math.round(maximum) + 1; i++) {
        narray.push(i)
    }

    stack = d3.histogram()
        .domain(x.domain())
        .thresholds(narray)
        (now_data);
    stack = stack.map((d) => {
        return d.length
    })

    y.domain([0, d3.max(bins, function (d) { return d.length; })])
    var g = d3.select('.grid')
        .call(make_y_gridlines(y)
            .tickSize(-width_graph)
            .tickFormat("")
        )

    var all_g = d3.selectAll(class_name)

    var g = all_g.selectAll('.body_graph')

    var bar = g.selectAll(".bar")
        .remove()
        .exit()
        .data(bins)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function (d) { return "translate(" + (x(d.x0) + x(bins[0].x1) - x(bins[0].x0)) + "," + height + ")"; });

    let rect = bar.append("rect")
        .attr("x", 1)
        .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1.0)
        .attr("transform", "rotate(180)")
        .attr("fill", color)

    let text = bar.append("text")
        .attr("dy", ".75em")
        .attr("x", - (x(bins[0].x1) - x(bins[0].x0)) / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#000")
        .text(function (d) {
            if (d.length > 0) {
                return formatCount(d.length);
            }
            else {
                return "";
            }
        })


    axis_x = d3.select('.axis--x')

    axis_y = d3.select('.axis--y')

    if (animate) {
        rect = rect.transition()
            .duration(750)
            .delay(function (d, i) { return i * 10; })
        text = text.transition()
            .duration(750)
            .delay(function (d, i) { return i * 10; })

        axis_x = axis_x.transition().duration(500);
        axis_y = axis_y.transition().duration(500);
    }
    axis_x.call(d3.axisBottom(x));
    axis_y.call(d3.axisLeft(y));
    rect.attr("height", function (d) { return height - y(d.length); });
    text.attr("y", function (d) {
        let real_y = y(d.length) - height + 10
        if (real_y > -13)
            real_y = -13;
        return real_y;
    });

}


function hue(h) {
    // svg.style("background-color", d3.hsl(h, 0.8, 0.8));

    bin_size = Math.round(h / 2) * 2
    handle.attr("transform", "translate(" + slide_x(bin_size) + "," + 0 + ")");
    handle.select("text")
        .text(formatCount(bin_size))
        .attr("transform", "translate(" + -getWidthTick(bin_size) / 2 + "," + 20 + ")");
    update_graph(false)
}

function hueMax(h) {
    maximum = Math.round(h);
    maximum = maximum > Math.round(d3.max(data) * 1.6) ? Math.round(d3.max(data) * 1.6) : maximum
    now_data = data.filter((d) => {
        return d >= minimum && d <= maximum
    })

    x.domain([minimum, maximum])
    x2.domain([minimum, maximum])

    handle_max.attr("transform", "translate(" + slide_x_max(maximum) + "," + 0 + ")");
    handle_max.select("text")
        .text(formatCount(maximum))
        .attr("transform", "translate(" + -getWidthTick(maximum) / 2 + "," + 20 + ")");
    update_graph(false)
    selected_line.attr("x2", slide_x_max(maximum))
}

function hueMin(h) {
    minimum = Math.round(h);
    now_data = data.filter((d) => {
        return d >= minimum && d <= maximum
    })

    x.domain([minimum, maximum])
    x2.domain([minimum, maximum])

    selected_line.attr("x1", slide_x_max(minimum))
    handle_min.attr("transform", "translate(" + slide_x_max(minimum) + "," + 0 + ")");
    handle_min.select("text")
        .text(formatCount(minimum))
        .attr("transform", "translate(" + -getWidthTick(minimum) / 2 + "," + 20 + ")");
    update_graph(false)
}

function toggleScale() {
    if (scaleLog) {
        $('#changeScale').prop('checked', false);
        minimum = 0
        x = d3.scaleLinear()
            .domain([minimum, maximum])
            .range([0, width_graph])

        x2 = d3.scaleLinear()
            .domain([minimum, maximum])
    } else {
        $('#changeScale').prop('checked', true);
        minimum = 1
        x = d3.scaleLog().clamp(true)
            .domain([minimum, maximum])
            .range([0, width_graph])
            .base(20)

        x2 = d3.scaleLog().clamp(true)
            .domain([minimum, maximum])
            .base(20)
    }
    slide_x_max.domain([minimum, maximum])
    hueMin(minimum)
    update_graph(true)
    scaleLog = !scaleLog
}