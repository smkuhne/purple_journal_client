// Lets the console know that purple journal is starting
console.log("Now loading purple journal extension.");

/**
 * Define some required constants
 */
var arrow = '<svg id="arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path stroke="white" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/><path fill="none" d="M0 0h24v24H0V0z"/></svg>';
var sidebar_visible = false;
var page_original = "";

/**
 * Sets up the sidebar structure and appends classes and information
 */
sidebar_element = document.createElement('div');
sidebar_content = document.createElement('div');
sidebar_slider = document.createElement('div');
page_content = document.createElement('div');
sidebar_content.setAttribute('id', 'purple-sidebar');
sidebar_slider.setAttribute('id', 'purple-slider');
sidebar_element.setAttribute('class', 'purple-sidebar purple-sidebar-retracted');
sidebar_content.setAttribute('class', 'purple-content');
sidebar_slider.setAttribute('class', 'purple-slider');
page_content.innerHTML = document.body.innerHTML;
page_original = page_content.innerHTML;
document.body.innerHTML = "";
sidebar_element.appendChild(sidebar_content);
sidebar_element.appendChild(sidebar_slider);
document.body.appendChild(sidebar_element);
document.body.appendChild(page_content);
sidebar_slider.innerHTML = arrow;
document.getElementById('arrow').setAttribute('class', 'arrow arrow-retracted');

var original = document.body.innerHTML;

/**
 * Get the html for a the contents of the sidebar and then load it into the sidebar
 */
const url = chrome.runtime.getURL('html/sidebar.html');
fetch(url)
    .then((response) => response.text())
    .then((sidebar_content) => {
        document.getElementById("purple-sidebar").innerHTML = sidebar_content;
        start();
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

analyze_article(window.location, callback, true);

function callback(stage, content) {
    switch(stage) {
        case 1:
            console.log('Sentiment');
            var negative = 0;
            var neutral = 0;
            var positive = 0;
            var general_sentiment = "none";
            var content_text = "";

            page_content.innerHTML = "";

            console.log(content);

            for (let i = 0; i < content.sentiments.sentences.length; i++) {
              if (content.sentiments.sentences[i].sentiment.score < -0.25) {
                negative += content.sentiments.sentences[i].sentiment.magnitude;
                if (general_sentiment === "negative") {
                  content_text += content.sentiments.sentences[i].text.content;
                } else {
                  createParagraph(general_sentiment, content_text);
                  content_text = "";
                }
                general_sentiment = "negative";
              } else if (content.sentiments.sentences[i].sentiment.score > 0.25) {
                positive += content.sentiments.sentences[i].sentiment.magnitude;
                if (general_sentiment === "positive") {
                  content_text += content.sentiments.sentences[i].text.content;
                } else {
                  createParagraph(general_sentiment, content_text);
                  content_text = "";
                }
                general_sentiment = "positive";
              } else {
                neutral += content.sentiments.sentences[i].sentiment.magnitude; 
                if (general_sentiment === "neutral") {
                  content_text += content.sentiments.sentences[i].text.content;
                } else {
                  createParagraph(general_sentiment, content_text);
                  content_text = "";
                }
                general_sentiment = "neutral";
              }
            }

            var total = negative + neutral + positive;
            negative = Math.round(negative / total * 100);
            neutral = Math.round(neutral / total * 100);
            positive = Math.round(positive / total * 100);
            updateSentimentChart(positive, neutral, negative);
            break;
        case 2:
            console.log("Summary");
            updateSummaryText(content.sm_api_content);
            break;
        case 3:
            console.log(content);
            break;
    }
}

function createParagraph(general_sentiment, content) {
  console.log(general_sentiment);
  var color = "white";

  if (general_sentiment == "negative") {
    color = "#de647c";
  } else if (general_sentiment == "positive") {
    color = "#6b97e8";
  } else {
    color = "#9d5edb";
  }

  var container = document.createElement('div');
  container.setAttribute('style', 'display: flex; flex-direction: row; width: 100%')
  var bar = document.createElement('div');
  bar.setAttribute('style', `background-color:${color}; min-width: 10px !important; height: 100%; display: block; margin-right: 5px;border-radius: 5px`);
  var inner = document.createElement('div');
  inner.setAttribute('style', 'display: block');
  inner.innerHTML = content;
  container.appendChild(bar);
  container.appendChild(inner);
  page_content.appendChild(container);
  bar.style.height = `${inner.clientHeight}px`;
}

function updateBiasChart( factual, opinion) {
    var chart = new CanvasJS.Chart("biasChartContainer", {
      theme: "dark2", 
      exportEnabled: false,
      animationEnabled: true,
      title: {
        text: "This Article is approximately"
      },
      data: [{
        type: "pie",
        startAngle: -90,
        toolTipContent: "<b>{label}</b>: {y}",
        showInLegend: "true",
        legendText: "{label}",
        indexLabelFontSize: 16,
        indexLabel: "{label}",
        dataPoints: [{y: factual, label:"factual"}, {y: opinion, label:"opinion"}]
      }]
    });
    chart.render();
  }

  function updateSentimentChart(positive, neutral, negative) {
    var chart = new CanvasJS.Chart("sentimentChartContainer", {
      theme: "dark2", 
      exportEnabled: false,
      animationEnabled: true,
      title: {
        text: "This Article is approximately"
      },
      data: [{
        type: "pie",
        startAngle: -90,
        toolTipContent: "<b>{label}</b>: {y}%",
        showInLegend: "true",
        legendText: "{label}",
        indexLabelFontSize: 16,
        indexLabel: "{label}",
        dataPoints: [{y: positive, label:"Positive", color: "#6b97e8"}, {y: neutral,
          label:"Neutral", color: "#9d5edb"}, {y: negative, label:"Negative", color: "#de647c"}]
      }]
    });
    chart.render();
  }

  function updateSummaryText(summaryText) {
    document.getElementById("summaryTextBox").innerHTML = summaryText
  }

  function addNextArticles(articles) {
    var content = ""
    for (var i = 0; i < articles.length; i++) {
      content+= "<a href='" + articles[i].url + "'><li class='mdl-list__item'>"
        + articles[i].name + "</li></a>\n"
    }
    document.getElementById("suggestedArticlesContainer").innerHTML = content
  }

  function start() {
    console.log("hey");
    updateBiasChart(1,0) // Factual, Opinion
    updateSentimentChart(0,1,0) // Pos, Neut, Negative
    updateSummaryText("Loading") // Summary string
    var items = [
      {name:"CNN", url: "https://www.cnn.com"},
      {name:"New York Times", url: "https://www.nytimes.com"},
      {name:"Fox News", url: "https://www.foxnews.com"}
      ]
    addNextArticles(items);
  }


