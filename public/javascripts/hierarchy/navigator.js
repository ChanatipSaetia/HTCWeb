var item_list = [{
    'name': 'root',
    'level': 0,
}]

var nav_width = parseInt(d3.select(".graphbox").style("width")),
    nav_height = 100;

var nav_svg = d3.select(".navigator")
    .attr("width", nav_width)
    .attr("height", nav_height)

let each_margin = 30
let start_number_box = 8
let number_box = start_number_box
let box_size = ((nav_width - 80 - each_margin * (number_box - 1)) / number_box)

updateNav(item_list)

function updateNav(item_list) {
    if (item_list.length > start_number_box)
        number_box = item_list.length
    else
        number_box = start_number_box
    box_size = ((nav_width - each_margin * (number_box + 1)) / number_box)
    var data_nav = nav_svg.selectAll('.each_nav')
        .data(item_list)

    data_nav.exit().remove()

    var each_nav = data_nav.enter().append('g')
        .attr('class', 'each_nav')
        .attr('transform', (d) => 'translate(' + (each_margin + (box_size + each_margin) * d.level) + ',' + each_margin + ')')
        .on('click', clickNav)
    // .on('Mo')

    each_nav.append('rect')
        .style("width", 0)
        .style("height", "40")
        .transition().duration(100)
        .style("width", box_size)

    each_nav.append('text')
        .text((d) => d.name)
        .attr('class', 'nav_text')
        .attr('transform', (d) => {
            var width = getWidth(d.name)
            return 'translate(' + (box_size - width) / 2 + ',' + 25 + ')'
        })

    each_nav.append('text')
        .attr('class', 'arrow')
        .text('')
        .attr('transform', (d) => 'translate(' + (box_size + 11) + ',' + 25 + ')')


    transform_nav = data_nav
        .transition()
        .duration(100)
        .attr('transform', (d) => 'translate(' + (each_margin + (box_size + each_margin) * d.level) + ',' + each_margin + ')')

    transform_nav.select('rect')
        .style("width", box_size)

    transform_nav.select('.nav_text')
        .attr('transform', (d) => {
            var width = getWidth(d.name)
            return 'translate(' + (box_size - width) / 2 + ',' + 25 + ')'
        })

    transform_nav.select('.arrow')
        .text((d) => {
            if (d.level != item_list.length - 1)
                return '>'
            else
                return ''
        })
        .attr('transform', (d) => 'translate(' + (box_size + 11) + ',' + 25 + ')')
}

function clickNav(d, i) {
    if (transforming || i == node_index.length)
        return
    parent_max = i - 2//level
    for (let j in map_index) {
        if (map_index[j] >= node_index[i])
            delete map_index[j]
    }
    item_list = item_list.slice(0, i)
    node_index = node_index.slice(0, i)
    node = node.slice(0, node_index[i])
    $.ajax({
        url: '/core/' + dataset + '/hierarchy/' + d.name,
        type: 'get',
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
        },
        error: function (err) {
            console.error(err);
            $('.result').text('Error!')
        }
    });
}