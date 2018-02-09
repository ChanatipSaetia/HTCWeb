function create_graph(class_name, xaxis, yaxis, color) {


    let graph = d3.select(class_name)
    let margin = 20;

    var width = parseInt(d3.select(".graphbox").style("width")) - margin * 3,
        height = width * 0.4 - margin * 2;

    graph.attr('width', width + margin * 3)
        .attr('height', height + margin * 2)

    var data = d3.range(1000).map(d3.randomLogNormal(Math.log(2), .4));
    var formatCount = d3.format(",.0f");

    var svg = d3.select(class_name)
        .attr("class", class_name + " " + color),
        g = svg.append("g").attr("transform", "translate(" + (margin + 20) + "," + margin + ")");

    var x = d3.scaleLinear()
        .domain([0, Math.round(d3.max(data) * 1.6)])
        .rangeRound([0, width]);

    var bins = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(10))
        (data);

    var y = d3.scaleLinear()
        .domain([0, d3.max(bins, function (d) { return d.length; })])
        .range([height, 0]);


    // // gridlines in y axis function
    function make_y_gridlines() {
        return d3.axisLeft(y)
            .ticks(3)
    }
    // add the Y gridlines
    g.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        )

    var bar = g.selectAll(".bar")
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

    // bar.append("text")
    //     .attr("dy", ".75em")
    //     .attr("x", - (x(bins[0].x1) - x(bins[0].x0)) / 2)
    //     .attr("text-anchor", "middle")
    //     .attr("fill", function (d) {
    //         if (d.length < 30)
    //             return "#000"
    //         else
    //             return "#fff"
    //     })
    //     .text(function (d) {
    //         if (d.length > 0) {
    //             return formatCount(d.length);
    //         }
    //         else {
    //             return "";
    //         }
    //     }).transition()
    //     .duration(750)
    //     .delay(function (d, i) { return i * 10; })
    //     .attr("y", function (d) {
    //         let real_y = y(d.length) - height + 10
    //         if (real_y > -13)
    //             real_y = -13;
    //         return real_y;
    //     });




    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(3))
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
        // .attr("transform", "translate(0," + height + ")")
        .call(d3.axisLeft(y).ticks(3))
        .append("text")
        // .attr("transform", "rotate(-90)")
        .attr("x", 50)
        .attr("y", -10)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .attr("fill", "black")
        .text("# of " + yaxis);
}

create_graph('.dc_graph', "documents", "classes", "tertiary")
create_graph('.df_graph', "documents", "features", "primary")
create_graph('.cf_graph', "classes", "features", "tertiary")
create_graph('.fc_graph', "features", "classes", "primary")

