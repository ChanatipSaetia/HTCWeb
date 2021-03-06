
let margin = 30,
    width = parseInt(d3.select(".graphbox").style("width")) - margin * 3,
    height = width * 0.7 - margin * 2;

let dataset = $('.dataset_name').text().trim()

if (height > 550) {
    height = 550
}

var max_value = 0;
query_data = $('.col-md-4.active').attr('data')
$.ajax({
    async: false,
    url: '/core/' + dataset + '/level/' + query_data,
    type: 'get',
    success: function (result) {
        data = result
        for (let i of data) {
            if (max_value < i.data) {
                max_value = i.data
            }
        }
        console.log(data);
    },
    error: function (err) {
        console.error(err);
        $('.result').text('Error!')
    }
});


let level_rect_width = 160

let font_size = "16px"

function getWidth(text) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    ctx.font = font_size + " Open Sans";
    var w = ctx.measureText(text).width;
    return w
}
// set the ranges
var y = d3.scaleBand()
    .range([height, 0])
    .padding(0.1);

var x = d3.scaleLinear()
    .domain([0, max_value * 1.2])
    .rangeRound([0, width]);

// append the svg object to the body of the page
// append a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select(".graph")
    .attr('width', width + margin * 3)
    .attr('height', height + margin * 2 + 20)
svg = svg.append("g")
    .attr("transform", "translate(" + (margin + 20) + "," + margin + ")")

// format the data
// data.forEach(function (d) {
//     d.sales = +d.sales;
// });

// Scale the range of the data in the domains
// x.domain([0, d3.max(data, function (d) { return d.sales; })])
y.domain(data.map(function (d) { return d.level; }));
//y.domain([0, d3.max(data, function(d) { return d.sales; })]);

// append the rectangles for the bar chart
level = svg.selectAll(".level")
    .data(data)
    .enter().append("g")
    .attr("transform", function (d) { return 'translate(0,' + y(d.level) + ')'; })
    .attr("class", "level")

level.append("rect")
    .attr("class", (d, i) => {
        color = ""
        if (query_data == "classes") {
            color = "first"
        } else if (query_data == "leaf") {
            color = "second"
        } else {
            color = "third"
        }
        return "bar " + color;
    })
    .attr("height", y.bandwidth()).transition()
    .duration(750)
    .delay(function (d, i) { return i * 10; })
    .attr("width", function (d) { return x(d.data); });

level.append("text")
    .attr("class", "bar-text")
    .attr("y", function (d) { return (y.bandwidth() / 2) + 5; })
    .text((d) => {
        return d3.format(",.0f")(d.data)
    })
    .transition()
    .duration(750)
    .delay(function (d, i) { return i * 10; })
    .attr("x", function (d) { return x(d.data) + 10; })

level.append('line')
    .attr("x1", 50)
    .attr("x2", width - 10)
    .attr("y1", (d) => { return y.bandwidth() })
    .attr("y2", (d) => { return y.bandwidth() })
    .attr("stroke", "#d6d6d6")

level.append('text')
    .attr("transform", (d) => {
        var w = getWidth(d.name)
        return 'translate(' + (width - w) + ',' + (y.bandwidth() - 10) + ')'
    })
    .style('font-size', "16px")
    .text((d, i) => {
        return "Level " + i
    })


svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + (height + 20) + ")")
    .call(d3.axisBottom(x))
    .append("text")
    // .attr("transform", "rotate(-90)")
    .attr("x", 80)
    .attr("y", -10)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("fill", "black")
    .text("# of " + query_data);
