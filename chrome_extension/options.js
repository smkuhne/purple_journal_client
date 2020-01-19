function showCurrent() {
  chrome.storage.sync.get(['color_scheme', 'sidebar_width', 'sidebar_font_size'], function(result) {
    console.log(result.color_scheme)
    //console.log("width " + result.sidebar_width)
    //console.log("text " + result.sidebar_font_size)
    //document.getElementsByName("sidebar_width")[0].value = result.sidebar_width
    //document.getElementsByName("sidebar_font_size")[0].value = result.sidebar_font_size          
    document.getElementById(result.color_scheme).checked = true;
  });
}

function doThing() {
  var object = {color_scheme: "default", sidebar_width: 100, sidebar_font_size: 100}
  object.color_scheme = document.querySelector("input[name=color_scheme]:checked").value    
  //object.sidebar_font_size = document.getElementsByName("sidebar_font_size")[0].value 
  //object.sidebar_width = document.getElementsByName("sidebar_width")[0].value
  console.log(object.color_scheme)
  //console.log("width " + object.sidebar_width)
  //console.log("text " + object.sidebar_font_size)
  chrome.storage.sync.set(object)
  chrome.tabs.getCurrent(function(tab) {
    chrome.tabs.remove(tab.id, function() { });
  });
}

showCurrent()
document.getElementById("buttonThatSaves").addEventListener("click", doThing)
