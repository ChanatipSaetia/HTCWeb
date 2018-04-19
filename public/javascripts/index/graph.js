function create_graph(class_name, xaxis, yaxis, color, data) {

    let graph = d3.select(class_name)
    let margin = 20;

    var width = parseInt(d3.select(".graphbox").style("width")) - margin * 3,
        height = width * 0.6 - margin * 2;

    if (height >= 150) {
        height = 150
    }

    graph.attr('width', width + margin * 3)
        .attr('height', height + margin * 2)

    var formatCount = d3.format(",.0f");

    var svg = d3.select(class_name)
        .attr("class", class_name + " " + color),
        g = svg.append("g").attr("transform", "translate(" + (margin + 20) + "," + margin + ")");

    maximum = Math.round(d3.max(data) * 1.6)

    var x = d3.scaleLinear()
        .domain([0, maximum])
        .rangeRound([0, width]);

    x2 = d3.scaleLinear()
        .domain([0, maximum])

    var bins = d3.histogram()
        .domain(x.domain())
        .thresholds([...Array(10).keys()].map((x) => x2.invert(x / 10)))
        (data);

    if (bins[1].length / bins[0].length < 0.05) {
        x = d3.scaleLog().clamp(true)
            .domain([1, maximum])
            .range([0, width])
            .base(20)

        x2 = d3.scaleLog().clamp(true)
            .domain([1, maximum])
            .base(20)

        bins = d3.histogram()
            .domain(x.domain())
            .thresholds([...Array(10).keys()].map((x) => x2.invert(x / 10)))
            (data);
    }

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
        // .atttr("transform", "rotate(-90)")
        .attr("x", 50)
        .attr("y", -10)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .attr("fill", "black")
        .text("# of " + yaxis);
}

let dataset = $('.dataset_name').text().trim()

$.ajax({
    url: '/core/' + dataset + '/index',
    type: 'get',
    // data: {
    //     code: "match x=(n:Year {Symbol: '" + val + "'})-[:board]-() return x"
    // },
    success: function (result) {
        create_graph('.dc_graph', "documents", "classes", "third", result[0])
        create_graph('.df_graph', "documents", "features", "first", result[2])
        create_graph('.cf_graph', "classes", "features", "third", result[3])
        create_graph('.fc_graph', "features", "classes", "first", result[1])
    },
    error: function (err) {
        console.error(err);
        $('.result').text('Error!')
    }
});

