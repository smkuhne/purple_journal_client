console.log("Now loading purple journal extension.");

var sidebar_content = "";
const url = chrome.runtime.getURL('html/sidebar.html');
console.log

console.log(url);

fetch(url)
    .then((response) => response.text())
    .then((sidebar_content) => {
        webpage_content = document.body.innerHTML;

        document.body.innerHTML = `
            <div style="display: flex; flex-direction: row">
                <div id="sidebar"
                    style="min-width: 100px; display: inline-flex; background-color: black">
                    ${sidebar_content}
                </div>
                <div id="webpage"
                    style="display: inline-flex; flex-grow: 1">
                    ${webpage_content}
                </div>
            </div>`
    });
