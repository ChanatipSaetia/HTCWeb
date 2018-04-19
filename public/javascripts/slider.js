
let dataset = $('.dataset_name').text().trim()
$.ajax({
    async: false,
    url: '/core/' + dataset + '/' + yaxis + '/' + xaxis,
    type: 'get',
    // data: {
    //     code: "match x=(n:Year {Symbol: '" + val + "'})-[:board]-() return x"
    // },
    success: function (result) {
        data = result;
        console.log(data);
    },
    error: function (err) {
        console.error(err);
        $('.result').text('Error!')
    }
});

function getWidthTick(text) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    ctx.font = 10 + "px Open Sans";
    var w = ctx.measureText(text).width;
    return w
}


var formatCount = d3.format(",.0f");

let margin = 30;

var width = parseInt(d3.select(".slide_box").style("width")) - margin * 3;

var minimum = 0
var maximum = 200000
maximum = maximum > Math.round(d3.max(data) * 1.1) ? Math.round(d3.max(data) * 1.1) : maximum

var slide_x = d3.scaleLinear()
    .domain([10, 50])
    .rangeRound([0, width])
    .clamp(true);

var height = 10;
var svg = d3.select(".slide")
    .attr('width', width + margin * 3)
    .attr('height', height + margin);


var slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + margin + "," + 10 + ")");

var inset = slider.append("line")
    .attr("class", "track")
    .attr("x1", slide_x.range()[0])
    .attr("x2", slide_x.range()[1])
    .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
    .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function () { slider.interrupt(); })
        .on("start drag", function () { hue(slide_x.invert(d3.event.x)); }));

var handle = slider.insert("g", ".track-overlay")
    .attr("transform", "translate(" + 0 + "," + 0 + ")");

handle.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);
handle.append("text")
    .attr("class", "ticks")
    .text("10")
    .attr("transform", "translate(" + -getWidthTick("10") / 2 + "," + 20 + ")");



