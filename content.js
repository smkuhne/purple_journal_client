webpage_content = document.body.innerHTML;

document.body.innerHTML = `
    <div style="display: flex; flex-direction: row">
        <div id="sidebar"
            style="min-width: 100px; display: inline-flex; background-color: black">
        </div>
        <div id="webpage"
            style="display: inline-flex; flex-grow: 1">
            ${webpage_content}
        </div>
    </div>`