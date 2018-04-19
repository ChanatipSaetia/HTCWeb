

function exportData(revert) {
    let prefile_name = revert ? 'un' : ''
    $.ajax({
        url: '/core/' + dataset + '/export/' + yaxis + '/' + xaxis,
        type: 'get',
        data: {
            min: minimum,
            max: maximum,
            revert: revert,
        },
        success: function (rows) {
            rows.unshift(['name', "number_of_" + xaxis])
            let csvContent = "data:text/csv;charset=utf-8,";
            rows.forEach(function (rowArray) {
                let row = rowArray.join(",");
                csvContent += row + "\r\n";
            });
            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", prefile_name + "selected_" + yaxis + ".csv");
            document.body.appendChild(link); // Required for FF

            link.click(); // This will download the data file named "my_data.csv".
            link.remove()
            console.log(rows);
        },
        error: function (err) {
            console.error(err);
            $('.result').text('Error!')
        }
    });
}