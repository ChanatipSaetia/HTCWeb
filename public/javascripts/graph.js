var class_name = '.graph'
var color = 'tertiary'
var minimum = 0
var maximum = 200000

let graph = d3.select(class_name)
let margin = 30;

var width = parseInt(d3.select(".graphbox").style("width")) - margin * 3,
    height = width * 0.4 - margin * 2;

graph.attr('width', width + margin * 3)
    .attr('height', height + margin * 2)

var formatCount = d3.format(",.0f");


function getWidth(text) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    ctx.font = 36 + " Open Sans";
    var w = ctx.measureText(text).width;
    return w
}

function getHeight(text) {
    return 10
}

var svg = d3.select(class_name),
    g = svg.append("g")
        .attr("transform", "translate(" + (margin + 20) + "," + margin + ")");

maximum = maximum > Math.round(d3.max(data) * 1.6) ? Math.round(d3.max(data) * 1.6) : maximum

document.getElementById("max").innerHTML = d3.format(",.2f")(d3.max(data))
document.getElementById("min").innerHTML = d3.format(",.2f")(d3.min(data))
document.getElementById("average").innerHTML = d3.format(",.2f")(d3.mean(data))
document.getElementById("number_of_classes").innerHTML = data.length

var x = d3.scaleLinear()
    .domain([minimum, maximum])
    .rangeRound([0, width]);

var bins = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(20))
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
        .tickSize(-width)
        .tickFormat("")
    )

let body_graph = g.append("g").attr("class", "body_graph " + color)
var bar = body_graph.selectAll(".bar")
    .data(bins)
    .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function (d) { return "translate(" + (x(d.x0) + x(bins[0].x1) - x(bins[0].x0)) + "," + height + ")"; });

bar.append("rect")
    .attr("x", 1)
    .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1.0)
    .attr("transform", "rotate(180)")
    .attr("fill", color).transition()
    .duration(750)
    .delay(function (d, i) { return i * 10; })
    .attr("height", function (d) { return height - y(d.length); });

bar.append("text")
    .attr("dy", ".75em")
    .attr("x", - (x(bins[0].x1) - x(bins[0].x0)) / 2)
    .attr("text-anchor", "middle")
    .attr("fill", function (d) {
        if (getHeight(formatCount(d.length)) > height - y(d.length))
            return "#000"
        else
            return "#fff"
    })
    .text(function (d) {
        if (d.length > 0) {
            return formatCount(d.length);
        }
        else {
            return "";
        }
    }).transition()
    .duration(750)
    .delay(function (d, i) { return i * 10; })
    .attr("y", function (d) {
        let real_y = y(d.length) - height + 10
        if (real_y > -13)
            real_y = -13;
        return real_y;
    });


g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .append("text")
    // .attr("transform", "rotate(-90)")
    .attr("x", width)
    .attr("y", -10)
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
    .text("<")

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
    .attr('width', width) // can't catch mouse events on a g element
    .attr('height', height)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseout', function () { // on mouse out hide line, circles and text
        d3.select(".mouse-line")
            .style("opacity", "1");
        d3.selectAll(".mouse-summary")
            .style("opacity", "1");
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
        x_sum = x_sum > width - boxsize / 2 ? width - boxsize / 2 : x_sum
        d3.select(".mouse-summary")
            .attr("transform", "translate(" + x_sum + ",20)")

        let threshold = Math.round(x.invert(mouse[0])) - minimum
        let less = stack.slice(0, threshold)
        less = less.length > 0 ? less.reduce((a, b) => { return a + b }) : 0
        let more = stack.slice(threshold, stack.length)
        more = more.length > 0 ? more.reduce((a, b) => { return a + b }) : 0
        d3.select(".less")
            .text(formatCount(less) + " " + yaxis)
        d3.select(".more")
            .text(formatCount(more) + " " + yaxis)

        d3.select(".xvalue")
            .attr("x", 60 + (-getWidth(formatCount(x.invert(mouse[0]))) / 2) + "px")
            .text(formatCount(x.invert(mouse[0])))
    });


function update_graph() {
    let new_minimum = document.getElementById("minFreq").value,
        new_maximum = document.getElementById("maxFreq").value;
    if (new_minimum != "")
        minimum = parseInt(new_minimum)
    if (new_maximum != "")
        maximum = parseInt(new_maximum)


    maximum = maximum > Math.round(d3.max(data) * 1.6) ? Math.round(d3.max(data) * 1.6) : maximum

    now_data = data.filter((d) => {
        return d >= minimum && d <= maximum
    })

    document.getElementById("max").innerHTML = d3.format(",.2f")(d3.max(now_data))
    document.getElementById("min").innerHTML = d3.format(",.2f")(d3.min(now_data))
    document.getElementById("average").innerHTML = d3.format(",.2f")(d3.mean(now_data))
    document.getElementById("number_of_classes").innerHTML = now_data.length


    x.domain([minimum, maximum])

    bins = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(20))
        (now_data);

    narray = []
    for (let i = 0; i < Math.round(maximum) + 1; i++) {
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
            .tickSize(-width)
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

    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1.0)
        .attr("transform", "rotate(180)")
        .attr("fill", color).transition()
        .duration(750)
        .delay(function (d, i) { return i * 10; })
        .attr("height", function (d) { return height - y(d.length); });

    bar.append("text")
        .attr("dy", ".75em")
        .attr("x", - (x(bins[0].x1) - x(bins[0].x0)) / 2)
        .attr("text-anchor", "middle")
        .attr("fill", function (d) {
            if (d.length < 20)
                return "#000"
            else
                return "#fff"
        })
        .text(function (d) {
            if (d.length > 0) {
                return formatCount(d.length);
            }
            else {
                return "";
            }
        }).transition()
        .duration(750)
        .delay(function (d, i) { return i * 10; })
        .attr("y", function (d) {
            let real_y = y(d.length) - height + 10
            if (real_y > -13)
                real_y = -13;
            return real_y;
        });

    d3.select('.axis--x')
        .transition().duration(500)
        .call(d3.axisBottom(x));

    d3.select('.axis--y')
        .transition().duration(500)
        .call(d3.axisLeft(y));
}
