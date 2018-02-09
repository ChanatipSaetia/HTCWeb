
let search_list = []
let previos_text = "1012301i230j"
let input_search = '<input type="email" class="input" id="input_search" oninput="updateText()" />'

function updateText() {
    let text = document.getElementById('input_search').value
    if (search_list.length >= 1) {
        document.getElementById('input_search').value = ""
        return
    }
    if (previos_text == text) {
        if (text.trim() == "")
            return
        text = text + " "
        text = text.split(" ")
        document.getElementById('input_search').value = text[text.length - 1]
        for (let i = 0; i < text.length - 1; i++) {
            search_list.push(text[i])
        }
        console.log(search_list)
        recreate_content()
    }
    previos_text = text
}


document.getElementById('input_search').addEventListener('keydown', function (event) {
    const key = event.key; // const {key} = event; ES6+
    if (key === "Backspace" || key === "Delete") {
        if (this.value == "") {
            search_list.pop()
            recreate_content()
        }
    }
});


function recreate_content() {
    let new_content = ""
    for (let i = 0; i < search_list.length; i++) {
        new_content += '<span class="hashtagKeyword">' + search_list[i] + '</span>'
    }
    new_content += input_search
    document.getElementsByClassName('root')[0].innerHTML = new_content
    document.getElementById("input_search").focus();

    document.getElementById('input_search').addEventListener('keydown', function (event) {
        const key = event.key; // const {key} = event; ES6+
        if (key === "Backspace" || key === "Delete") {
            if (this.value == "") {
                search_list.pop()
                recreate_content()
            }
        }
    });
}
// setInterval(updateText, 1000);