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
document.getElementById('arrow').setAttribute('class', 'arrow');

var custom_reader = document.createElement('div');
custom_reader.setAttribute('style', 'margin-left: 400px');
var page = "original";

/**
 * Get the html for a the contents of the sidebar and then load it into the sidebar
 */
const url = chrome.runtime.getURL('html/sidebar.html');
fetch(url)
    .then((response) => response.text())
    .then((sidebar_content) => {
        document.getElementById("purple-sidebar").innerHTML = sidebar_content;
        start();
    })
    .then(() => {
      console.log('listener');
      document.getElementById("switch-reader").style.display = 'none';
      document.getElementById("switch-reader").addEventListener('click', function(){
        console.log('click');
        if (page == "original") {
          page_content.innerHTML = "";
          page_content.appendChild(custom_reader);
          console.log('custom');
          page = "custom";
        } else if (page == "custom") {
          page_content.innerHTML = page_original;
          console.log('original');
          page = "original";
        }
      });
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

function callback(stage, content) {
    switch(stage) {
        case 1:
            var negative = 0;
            var neutral = 0;
            var positive = 0;
            var general_sentiment = "none";
            var content_text = "";

            var header = document.createElement('h4');
            header.setAttribute('style', 'margin: 30px')
            var splitter = document.createElement('hr');
            header.innerHTML = document.title;
            custom_reader.appendChild(header);
            custom_reader.appendChild(splitter);

            for (let i = 0; i < content.sentiments.sentences.length; i++) {
              if (content.sentiments.sentences[i].sentiment.score < -0.25) {
                negative += content.sentiments.sentences[i].sentiment.magnitude;
                if (general_sentiment === "negative") {
                  content_text += content.sentiments.sentences[i].text.content;
                } else {
                  createParagraph(general_sentiment, content_text);
                  content_text = "";
                  content_text += content.sentiments.sentences[i].text.content;
                }
                general_sentiment = "negative";
              } else if (content.sentiments.sentences[i].sentiment.score > 0.25) {
                positive += content.sentiments.sentences[i].sentiment.magnitude;
                if (general_sentiment === "positive") {
                  content_text += content.sentiments.sentences[i].text.content;
                } else {
                  createParagraph(general_sentiment, content_text);
                  content_text = "";
                  content_text += content.sentiments.sentences[i].text.content;
                }
                general_sentiment = "positive";
              } else {
                neutral += content.sentiments.sentences[i].sentiment.magnitude; 
                if (general_sentiment === "neutral") {
                  content_text += content.sentiments.sentences[i].text.content;
                } else {
                  createParagraph(general_sentiment, content_text);
                  content_text = "";
                  content_text += content.sentiments.sentences[i].text.content;
                }
                general_sentiment = "neutral";
              }
            }

            var total = negative + neutral + positive;
            negative = Math.round(negative / total * 100);
            neutral = Math.round(neutral / total * 100);
            positive = Math.round(positive / total * 100);
            updateSentimentChart(positive, neutral, negative);

            if(document.getElementById("switch-reader")) {
              document.getElementById("switch-reader").style.display = 'block';
            }

            if (content.document_score > -1 && content.document_score < -0.5) {
              document.getElementById("overallSentiment").innerHTML = "Overall Article Sentiment: Very Negative";
            } else if (content.document_score > -0.5 && content.document_score < -0.25) {
              document.getElementById("overallSentiment").innerHTML = "Overall Article Sentiment: Negative";
            } else if (content.document_score > -0.25 && content.document_score < 0.25) {
              document.getElementById("overallSentiment").innerHTML = "Overall Article Sentiment: Neutral";
            } else if (content.document_score > 0.25 && content.document_score < 0.5) {
              document.getElementById("overallSentiment").innerHTML = "Overall Article Sentiment: Positive";
            } else if (content.document_score > 0.5 && content.document_score < 1) {
              document.getElementById("overallSentiment").innerHTML = "Overall Article Sentiment: Very Positive";
            }            
            break;
        case 2:
            updateSummaryText(content.sm_api_content);
            break;
        case 3:
            console.log(content);
            similar_articles = content.filter(Boolean);
            for(var i = 0; i < similar_articles.length; i++) {
              similar_articles[i] = {"name": similar_articles[i].title, "url": similar_articles[i].url}
            }
            console.log(similar_articles)
            addNextArticles(similar_articles)
            break;
    }
}

function createParagraph(general_sentiment, content) {
  var color = "white";

  if (general_sentiment == "negative") {
    color = "#de647c";
  } else if (general_sentiment == "positive") {
    color = "#6b97e8";
  } else if (general_sentiment == "neutral") {
    color = "#9d5edb";
  } else {
    return;
  }

  var outer_container = document.createElement('div')
  outer_container.setAttribute('style', 'display: block; margin: 40px; width: calc(100% - 80px);')
  var container = document.createElement('div');
  container.setAttribute('style', 'display: table-row; padding: 10px')
  var bar = document.createElement('div');
  bar.setAttribute('style', `background-color:${color}; display: table-cell; min-width: 10px !important; height: 100%; margin-right: 5px;border-radius: 5px`);
  var inner = document.createElement('div');
  inner.setAttribute('style', 'font-size: 1.25rem; display: table-cell; padding: 10px');
  inner.innerHTML = content;
  container.appendChild(bar);
  container.appendChild(inner);
  outer_container.appendChild(container);
  custom_reader.appendChild(outer_container);
  bar.style.height = `100%`;
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
    var content = "";
    for (var i = 0; i < articles.length; i++) {
      content+= "<u><a href='" + articles[i].url + "'><li class='mdl-list__item'>"
        + articles[i].name + "</li></a></u>\n"
    }
    document.getElementById("suggestedArticlesContainer").innerHTML = content
  }

  function start() {
    console.log("hey");
    updateSentimentChart(0,1,0) // Pos, Neut, Negative
    updateSummaryText("Loading") // Summary string

    console.log(window.location.href);

    if(window.location.href.indexOf("chrome-extension://") != 0) {
      addNextArticles([{name: "Loading articles...", url: "#"}]);
      analyze_article(window.location, callback, true);
    } else {
      document.getElementById("switch-reader").remove();
      updateSentimentChart(22, 74, 4);
      updateSummaryText("When browsing your favorite news sites, this tab will show you: a summary of the article, and whether the article takes a positive, negative, or neutral approach to the topic. Additionally, it will display suggested further readings relating to the topic in the article.");
    
      var items = [
        {name:"Example link #1", url: "#"},
        {name:"Example link #2", url: "#"},
        {name:"Example link #3", url: "#"}
        ]
        addNextArticles(items);
    }
  }


