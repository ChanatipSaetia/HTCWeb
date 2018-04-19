let node = [];
let edge;
let map_index;
let node_index = []

let number_level = []
let dataset = $('.dataset_name').text().trim()

$.ajax({
    async: false,
    url: '/core/' + dataset + '/hierarchy/root',
    type: 'get',
    success: function (result) {
        let focus_index;
        node = result.node
        result_map = calculateMap(node)
        focus_index = result_map[0]
        map_index = result_map[1]
        edge = calculateEdge(node, result.edge, focus_index)
        node_index.push(node.length)
    },
    error: function (err) {
        console.error(err);
        $('.result').text('Error!')
    }
});

$.ajax({
    async: false,
    url: '/core/' + dataset + '/level/classes',
    type: 'get',
    success: function (result) {
        number_level = result.map((d) => d.data)
        number_level.unshift(1)
        console.log(number_level)
    },
    error: function (err) {
        console.error(err);
        $('.result').text('Error!')
    }
});

function calculateMap(node) {
    let focus_index = 0
    let map_index = {}
    for (let i in node) {
        map_index[node[i].name] = parseInt(i)
        if (node[i].focus)
            focus_index = i
    }
    return [focus_index, map_index]
}

function calculateEdge(node, new_edge_data, focus_index) {
    let edge = []
    for (let i of new_edge_data) {
        edge.push({
            'id': map_index[i.destination],
            'data': i.data
        })
    }
    ans = {}
    ans[focus_index] = edge
    return ans
}

let focus_level = 0
let parent_max = -1 //level

// Set the dimensions and margins of the diagram
var margin = { top: 20, right: 90, bottom: 30, left: 90 },
    width = parseInt(d3.select(".graphbox").style("width")),
    height = width * 0.65;

if (height > 550) {
    height = 550
}

var formatCount = d3.format(",.0f");
var formatCount_ratio = d3.format(",.3f");

function getWidth(text) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    ctx.font = font_size + " Open Sans";
    var w = ctx.measureText(text).width;
    return w
}

let transforming = false
let font_size = "16px"
let radius = 30
let node_color = "#62abff"
let node_color_hover = "#ffc562"
let level_rect_height = 40
let level_rect_width = 120
var svg = d3.select(".graph")
    .attr("width", width)
    .attr("height", height)

let each_level = {}
let path = []
let level = []
let current_node;
updateData(node, number_level, edge)
function diagonal(s, d) {
    path_edge = "M" + s.x + "," + s.y
        + "C" + (s.x + d.x) / 2 + "," + s.y
        + " " + (s.x + d.x) / 2 + "," + d.y
        + " " + d.x + "," + d.y;
    return path_edge
}


let radius_transform = d3.scaleLog().clamp(true)
    .domain([1, node[0].datas])
    .range([4, radius])

updateLevel(level)
createEdgeVisual(path)
createNodeVisual(current_node)


function createEdgeVisual(new_data) {

    var edge_figure = svg.selectAll('.grouppath').remove()
    edge_figure = svg.selectAll('.grouppath')
        .data(new_data)
        .enter().insert('g', '.node')
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
            return (d.data * 20) + 1
        })


    edge_figure.append('text')
        .attr("class", (d) => {
            return "pathtext-" + d.s.id + "-" + d.d.id
        })
        .attr("transform", (d) => {
            x = d.d.x - 80
            y = d.d.y
            if (!node[d.d.id].child) {
                x = d.s.x - 80
                y = d.s.y
            }
            return "translate(" + x + ", " + y + ")"
        })
        .text((d) => {
            return formatCount_ratio(d.data)
        })
        .style("opacity", "0");
}

function createNodeVisual(new_data) {
    transforming = true
    var node_data = svg.selectAll('.node')
        .data(new_data);

    node_data.exit().remove();
    trans_node = node_data.transition().duration(500)

    trans_node
        .attr('class', (d) => {
            if (d.focus) {
                return "node secondary"
            } else if (d.leaf) {
                return "node primary"
            } else {
                return "node tertiary"
            }
        })
        .style("opacity", (d) => {
            return d.level >= parent_max && !d.invisible ? 1 : 0
        })
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
        .on('end', () => {
            transforming = false
        })

    var node_figure = node_data.enter().append("g")
        .attr('class', (d) => {
            class_name = ""
            if (d.child) {
                class_name = "child "
            }
            if (d.focus) {
                return class_name + "node secondary"
            } else if (d.leaf) {
                return class_name + "node primary"
            } else {
                return class_name + "node tertiary"
            }
        })
        .style("opacity", (d) => {
            return d.level >= parent_max && !d.invisible ? 1 : 0
        })
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", handleMouseClick);

    node_figure.append('circle')
        .style('stroke', 'white')
        .style('stroke-width', 2)
        .attr('r', 0).transition()
        .duration(500)
        .attr('r', (d) => {
            return radius_transform(d.datas)
        })
        .on('end', () => {
            transforming = false
        })

    node_figure.append('text')
        .style("font-size", font_size)
        .style("fill", "black")
        .text((d) => {
            return d.name
        })
        .attr("transform", (d) => {
            return "translate(" + (radius_transform(d.datas) + 4) + ", 6)"
        })


    tooltip_g = node_figure.append('g')
        .attr("transform", (d) => {
            var width = getWidth(formatCount(d.datas))
            return "translate(-" + 0 + ", -15)"
        })
        .style("opacity", 0)

    tooltip_g.append('rect')
        .attr('class', 'hoverbox')
        .style("width", (d) => {
            return getWidth(formatCount(d.datas)) + 20
        })
        .style("height", "30")

    tooltip_g.append('text')
        .style("font-size", font_size)
        .style("fill", "white")
        .text((d) => {
            return formatCount(d.datas)
        })
        .attr("transform", (d) => {
            var width = getWidth(formatCount(d.datas))
            return "translate(10, 21)"
        })
}


function handleMouseOver(d, i) {
    if (!transforming) {
        d3.select(this)
            .transition()
            .duration(100)
            .select('g')
            .attr("transform", (d) => {
                var width = getWidth(formatCount(d.datas))
                return "translate(-" + (width + 30) + ", -15)"
            })
            .style("opacity", 1)
    }

}

function handleMouseOut(d, i) {
    if (!transforming) {
        d3.select(this)
            .transition()
            .duration(100)
            .select('g')
            .attr("transform", (d) => {
                var width = getWidth(formatCount(d.datas))
                return "translate(-" + 0 + ", -15)"
            })
            .style("opacity", 0)
    }

}

function handlePathMouseOver(d, i) {
    if (!transforming) {
        d3.select("#path-" + d.s.id + "-" + d.d.id)
            .transition()
            .duration(100)
            .style("stroke", "#bcbfca")
        d3.select(".pathtext-" + d.s.id + "-" + d.d.id)
            .transition()
            .style("opacity", 1)
    }
}

function handlePathMouseOut(d, i) {
    if (!transforming) {
        d3.select("#path-" + d.s.id + "-" + d.d.id)
            .transition()
            .style("stroke", "#dbdde4")
        d3.select(".pathtext-" + d.s.id + "-" + d.d.id)
            .transition()
            .style("opacity", 0)
    }
}


function levelMouseOver(d, i) {
    let level_dis = d3.select(this)
        .transition()

    level_dis.select('text')
        .text(d.number + " classes")
        .attr("transform", (d) => {
            var w = getWidth(formatCount(d.number) + " classes")
            return 'translate(' + (d.x - w - 10) + ',' + (height - level_rect_height / 2 + 7.5) + ')'
        })


    level_dis.select('rect')
        .attr("width", (d) => {
            return getWidth(d.number + " classes") + 20
        })
        .attr("transform", (d) => {
            var w = getWidth(d.number + " classes")
            return 'translate(' + (d.x - w - 20) + ',' + (height - level_rect_height) + ')'
        })
}
function levelMouseOut(d, i) {
    let level_dis = d3.select(this)
        .transition()

    level_dis.select('text')
        .text("Level " + d.level)
        .attr("transform", (d) => {
            var w = getWidth("Level " + d.level)
            return 'translate(' + (d.x - w - 10) + ',' + (height - level_rect_height / 2 + 7.5) + ')'
        })

    level_dis.select('rect')
        .attr("width", (d) => {
            return getWidth("Level " + d.level) + 20
        })
        .attr("transform", (d) => {
            var w = getWidth("Level " + d.level)
            return 'translate(' + (d.x - w - 20) + ',' + (height - level_rect_height) + ')'
        })
}

function updateData(node, number_level, edge) {
    each_level = {}
    path = []
    index = 0
    for (let i in node) {
        let n = node[i]
        n.id = index
        if (n.level >= parent_max && !n.invisible) {
            if (each_level[n.level] == undefined) {
                each_level[n.level] = [n]
            } else {
                each_level[n.level].push(n)
            }
        } else {
            try {
                node[i].x = current_node[i].x - x_space
                node[i].y = current_node[i].y
            } catch (e) {
                node[i].x = 0
                node[i].y = 0
            }
        }
        index++;
    }
    middle = (height - level_rect_height) / (2)
    middle_point = 0
    x_space = width / (Object.keys(each_level).length + 1)
    let c = 1
    level = []
    for (let s in each_level) {
        this_level = each_level[s]
        let r = 1
        for (let n of this_level) {
            y_space = (height - level_rect_height) / (this_level.length + 1)
            if (y_space == middle && !node[n.id].focus) {
                if (middle_point >= 1) {
                    while (y_space == middle) {
                        y_space += -25 + Math.floor(Math.random() * 5) * 25
                    }
                } else {
                    middle_point++;
                }
            }
            node[n.id].x = c * x_space
            node[n.id].y = r * y_space
            r++
        }
        level.push({
            "level": s,
            "x": (c * x_space),
            "number": number_level[s]
        })
        c++
    }

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
    current_node = node
}



function handleMouseClick(d, i) {
    if (!transforming && d.child) {
        d3.select(this)
            .transition()
            .select('g')
            .attr("transform", (d) => {
                var width = getWidth(formatCount(d.datas))
                return "translate(-" + (width / 2 + 10) + ", -10)"
            })
            .style("opacity", 0)
        parent_max++//level
        $.ajax({
            url: '/core/' + dataset + '/hierarchy/' + d.name,
            type: 'get',
            // data: {
            //     code: "match x=(n:Year {Symbol: '" + val + "'})-[:board]-() return x"
            // },
            success: function (result) {
                let focus_index;
                add_data = result.node
                focus_index = queryNewData(add_data)
                item_list.push({
                    'name': d.name,
                    'level': item_list.length,
                })
                updateNav(item_list)
                edge = calculateEdge(node, result.edge, focus_index)
                updateData(node, number_level, edge)
                createNodeVisual(current_node)
                createEdgeVisual(path)
                updateLevel(level)
                node_index.push(node.length)
            },
            error: function (err) {
                console.error(err);
                $('.result').text('Error!')
            }
        });
    }
}

function updateLevel(level) {
    level_data = svg.selectAll('.level').data(level)
    level_data.exit().remove()
    level_data.transition().duration(500)
        .select('text')
        .text((d) => {
            return "Level " + d.level
        })
        .attr("transform", (d) => {
            var w = getWidth("Level " + d.level)
            return 'translate(' + (d.x - w - 10) + ',' + (height - level_rect_height / 2 + 7.5) + ')'
        })

    level_data.transition().duration(500)
        .select('rect')
        .attr("width", (d) => {
            return getWidth("Level " + d.level) + 20
        })
        .attr("transform", (d) => {
            var w = getWidth("Level " + d.level)
            return 'translate(' + (d.x - w - 20) + ',' + (height - level_rect_height) + ')'
        })

    level_data.transition().duration(500)
        .select('line')
        .attr("x1", (d) => d.x)
        .attr("x2", (d) => d.x)
        .attr("y1", 10)
        .attr("y2", height - 10)

    level_figure = level_data.enter().insert('g', '.grouppath')
        .attr("class", "level")
        .on("mouseover", levelMouseOver)
        .on("mouseout", levelMouseOut)

    level_figure.append('line')
        .attr("x1", (d) => d.x)
        .attr("x2", (d) => d.x)
        .attr("y1", 10)
        .attr("y2", height - 10)
        .attr("stroke", "#d6d6d6")

    level_figure.append('rect')
        .attr("width", (d) => {
            return getWidth("Level " + d.level) + 20
        })
        .attr("height", level_rect_height)
        .attr("class", "level_rect")
        .attr("transform", (d) => {
            var w = getWidth("Level " + d.level)
            return 'translate(' + (d.x - w - 20) + ',' + (height - level_rect_height) + ')'
        })

    level_figure.append('text')
        .attr("transform", (d) => {
            var w = getWidth("Level " + d.level)
            return 'translate(' + (d.x - w - 10) + ',' + (height - level_rect_height / 2 + 7.5) + ')'
        })
        .style('font-size', "16px")
        .style('fill', 'white')
        .text((d) => {
            return "Level " + d.level
        })
}

function queryNewData(add_data) {
    let focus_index = 0
    for (let i in node) {
        node[i].invisible = true
        node[i].child = false
        node[i].focus = false
    }
    for (let n of add_data) {
        if (!(n.name in map_index)) {
            map_index[n.name] = node.length
            node.push(n)
        } else {
            node[map_index[n.name]].invisible = false
            if (n.focus) {
                node[map_index[n.name]].focus = true
                focus_index = map_index[n.name]
            }
            node[map_index[n.name]].child = n.child
        }
    }
    return focus_index
}
