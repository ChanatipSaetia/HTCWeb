
var node = [
    {
        "name": "class4",
        "datas": 20,
        "level": 3,
        "focus": true,
    }, {
        "name": "Class2",
        "datas": 20,
        "level": 2,
    }, {
        "name": "class3",
        "datas": 2000,
        "level": 2,
    }, {
        "name": "class1",
        "datas": 20,
        "level": 1,
    }, {
        "name": "class5",
        "datas": 20,
        "level": 4,
    }, {
        "name": "class6",
        "datas": 20,
        "level": 4,
    }
]

let number_level = [10, 202, 40, 23]
var edge = {
    0: [{ "id": 4, "data": 10 }, { "id": 5, "data": 8 },],
    1: [{ "id": 0, "data": 5 },],
    2: [{ "id": 0, "data": 1 },],
    3: [{ "id": 1, "data": 14 }, { "id": 2, "data": 3 }],
}
// Set the dimensions and margins of the diagram
var margin = { top: 20, right: 90, bottom: 30, left: 90 },
    width = parseInt(d3.select(".graphbox").style("width")),
    height = width * 0.35;


var formatCount = d3.format(",.0f");

function getWidth(text) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    ctx.font = font_size + " Open Sans";
    var w = ctx.measureText(text).width;
    return w
}

let font_size = "16px"
let radius = 33
let node_color = "#62abff"
let node_color_hover = "#ffc562"
let level_rect_height = 40
let level_rect_width = 160
// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select(".graph")
    .attr("width", width)
    .attr("height", height)
// .append("g")
// .attr("transform", "translate("
// + margin.left + "," + margin.top + ")");

var each_level = {}
index = 0
for (let n of node) {
    n.id = index
    if (each_level[n.level] == undefined) {
        each_level[n.level] = [n]
    } else {
        each_level[n.level].push(n)
    }
    index++;
}

let c = 1
y_space = height / (Object.keys(each_level).length + 1)
level = []
for (let s in each_level) {
    this_level = each_level[s]
    x_space = (width - level_rect_width) / (this_level.length + 1)
    let r = 1
    for (let n of this_level) {
        node[n.id].x = r * x_space
        node[n.id].y = c * y_space
        r++
    }
    level.push({
        "level": s,
        "y": (c * y_space) + parseInt(radius) + (y_space - 2 * parseInt(radius)) / 2
    })
    c++
}

path = []
for (let e in edge) {
    all_t = edge[e]
    for (let t of all_t) {
        path.push({
            's': {
                'id': e,
                'x': node[e].x,
                'y': node[e].y
            },
            'd': {
                'id': t.id,
                'x': node[t.id].x,
                'y': node[t.id].y
            },
            'data': t.data
        })
    }
}

function diagonal(s, d) {
    path = `M ${s.x} ${s.y} ${d.x} ${d.y}`
    return path
}

var level_figure = svg.selectAll('.level')
    .data(level)
    .enter().append('g')
    .attr("class", "level")
    .on("mouseover", levelMouseOver)
    .on("mouseout", levelMouseOut)

level_figure.append('line')
    .attr("x1", 50)
    .attr("x2", width - 50)
    .attr("y1", (d) => { return d.y })
    .attr("y2", (d) => { return d.y })
    .attr("stroke", "#d6d6d6")

level_figure.append('rect')
    .attr("width", level_rect_width)
    .attr("height", level_rect_height)
    .attr("class", "level_rect")
    .attr("transform", (d) => {
        var w = getWidth(d.name)
        return 'translate(' + (width - w - 80) + ',' + (d.y - level_rect_height) + ')'
    })

level_figure.append('text')
    .attr("transform", (d) => {
        var w = getWidth(d.name)
        return 'translate(' + (width - w - 50) + ',' + (d.y - 10) + ')'
    })
    .style('font-size', "16px")
    .style('fill', 'white')
    .text((d) => {
        return "Level " + d.level
    })

var edge_figure = svg.selectAll('.grouppath')
    .data(path)
    .enter().append('g')
    .attr("class", (d) => {
        return "grouppath grouppath-" + d.s.id + "-" + d.d.id
    })
    .on("mouseover", handlePathMouseOver)
    .on("mouseout", handlePathMouseOut);

edge_figure.append('path')
    .attr("class", "link")
    .attr("id", (d) => {
        return "path-" + d.s.id + "-" + d.d.id
    })
    .attr('d', function (d) {
        return diagonal(d.s, d.d)
    })
    .style('opacity', "0.8")
    .style('stroke-width', 0).transition()
    .duration(500)
    .style('stroke-width', (d) => {
        return d.data + 4
    })


edge_figure.append('text')
    .attr("class", (d) => {
        return "pathtext-" + d.s.id + "-" + d.d.id
    })
    .attr("transform", (d) => {
        x = (d.s.x + d.d.x) / 2
        y = (d.s.y + d.d.y) / 2
        return "translate(" + x + ", " + y + ")"
    })
    .text((d) => {
        return formatCount(d.data)
    })
    .style("opacity", "0");

var node_figure = svg.selectAll('.node')
    .data(node)
    .enter().append("g")
    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

node_figure.append('circle')
    .attr('class', (d) => {
        if (d.focus) {
            return "secondary"
        } else {
            return "tertiary"
        }
    })
    .style('stroke', 'white')
    .style('stroke-width', 2)
    .attr('r', 0).transition()
    .duration(500)
    .attr('r', radius)

node_figure.append('text')
    .style("font-size", font_size)
    .style("fill", "white")
    .text((d) => {
        return d.name
    })
    .attr("transform", (d) => {
        var width = getWidth(d.name)
        return "translate(-" + (width / 2) + ", 6)"
    })

function handleMouseOver(d, i) {  // Add interactivity

    // Use D3 to slect element, change color and size
    d3.select(this)
        .transition()
        .select('circle').attr("class", "primary");


    d3.select(this)
        .transition()
        .select('text')
        .text((d) => {
            return formatCount(d.datas)
        })
        .attr("transform", (d) => {
            var width = getWidth(formatCount(d.datas))
            return "translate(-" + (width / 2) + ", 6)"
        })

}

function handleMouseOut(d, i) {  // Add interactivity

    // Use D3 to slect element, change color and size
    d3.select(this)
        .transition()
        .select('circle')
        .attr('class', (d) => {
            if (d.focus) {
                return "secondary"
            } else {
                return "tertiary"
            }
        })


    d3.select(this)
        .transition()
        .select('text')
        .text((d) => {
            return d.name
        })
        .attr("transform", (d) => {
            var width = getWidth(d.name)
            return "translate(-" + (width / 2) + ", 6)"
        })

}

function handlePathMouseOver(d, i) {
    d3.select("#path-" + d.s.id + "-" + d.d.id)
        .transition()
        .style("stroke", "#bcbfca")
    d3.select(".pathtext-" + d.s.id + "-" + d.d.id)
        .transition()
        .style("opacity", 1)
}

function handlePathMouseOut(d, i) {
    d3.select("#path-" + d.s.id + "-" + d.d.id)
        .transition()
        .style("stroke", "#dbdde4")
    d3.select(".pathtext-" + d.s.id + "-" + d.d.id)
        .transition()
        .style("opacity", 0)
}


function levelMouseOver(d, i) {
    d3.select(this)
        .transition()
        .select('text')
        .text(number_level[i] + " classes")
}
function levelMouseOut(d, i) {
    d3.select(this)
        .transition()
        .select('text')
        .text("Level " + (i + 1))
}