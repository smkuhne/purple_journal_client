
console.log("Now loading purple journal extension.");

var sidebar_content = "";
var webpage_content = document.body.innerHTML;

document.body.innerHTML = `
            <div style="display: flex; flex-direction: row">
                <div id="sidebar"
                    class="split"
                    style="min-width: 100px; display: flex; flex-direction: row; background-color: black">
                    ${sidebar_content}
                </div>
                <div id="webpage"
                    class="split"
                    style="display: inline-flex; flex-grow: 1">
                    ${webpage_content}
                </div>
            </div>`

const url = chrome.runtime.getURL('html/sidebar.html');

fetch(url)
    .then((response) => response.text())
    .then((sidebar_content) => {
        document.getElementById("sidebar").innerHTML = sidebar_content;
        webpage_content = document.body.innerHTML;
    });

Split(["#sidebar", "#webpage"], {
  gutterSize: 5,
  sizes: [20,80]
});

var items = document.body.getElementsByTagName("p");
for (var i = 0; i < items.length; i++) {
    var container = document.createElement('div');
    container.setAttribute('style', 'display: flex; flex-direction: row; width: 100%')
    var bar = document.createElement('div');
    bar.setAttribute('style', 'background-color:green; min-width: 10px !important; height: 100%; display: block; margin-right: 5px;');
    var inner = document.createElement('div');
    inner.setAttribute('style', 'display: block');
    inner.innerHTML = items[i].innerHTML;
    container.appendChild(bar);
    container.appendChild(inner);
    items[i].innerHTML = '';
    items[i].prepend(container);
    bar.style.height = `${inner.clientHeight}px`;
}