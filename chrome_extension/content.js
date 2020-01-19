// Lets the console know that purple journal is starting
console.log("Now loading purple journal extension.");

/**
 * Define some required constants
 */
var arrow = '<svg id="arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path stroke="white" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/><path fill="none" d="M0 0h24v24H0V0z"/></svg>';
var sidebar_visible = true;

/**
 * Sets up the sidebar structure and appends classes and information
 */
sidebar_element = document.createElement('div');
sidebar_content = document.createElement('div');
sidebar_slider = document.createElement('div');
sidebar_content.setAttribute('id', 'purple-sidebar');
sidebar_slider.setAttribute('id', 'purple-slider');
sidebar_element.setAttribute('class', 'purple-sidebar');
sidebar_content.setAttribute('class', 'purple-content');
sidebar_slider.setAttribute('class', 'purple-slider');
sidebar_element.appendChild(sidebar_content);
sidebar_element.appendChild(sidebar_slider);
document.body.appendChild(sidebar_element);
sidebar_slider.innerHTML = arrow;
document.getElementById('arrow').setAttribute('class', 'arrow arrow-retracted');

/**
 * Get the html for a the contents of the sidebar and then load it into the sidebar
 */
const url = chrome.runtime.getURL('html/sidebar.html');
fetch(url)
    .then((response) => response.text())
    .then((sidebar_content) => {
        document.getElementById("purple-sidebar").innerHTML = sidebar_content;
    });

/**
 * Upon pressing the slider, expand or retract based on current state
 */
document.getElementById("purple-slider").addEventListener("click", function(){
    if (sidebar_visible) {
        sidebar_visible = !sidebar_visible;
        sidebar_element.setAttribute('class', 'purple-sidebar purple-sidebar-retracted');
        document.getElementById('arrow').setAttribute('class', 'arrow');
    } else {
        sidebar_visible = !sidebar_visible;
        sidebar_element.setAttribute('class', 'purple-sidebar');
        document.getElementById('arrow').setAttribute('class', 'arrow arrow-retracted');
    }
});

/**
 * Go through all paragraphs and mark them
 */
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