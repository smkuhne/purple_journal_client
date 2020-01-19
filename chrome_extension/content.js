// Lets the console know that purple journal is starting
console.log("Now loading purple journal extension.");

/**
 * Define some required constants
 */
var arrow = '<svg id="arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path stroke="white" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/><path fill="none" d="M0 0h24v24H0V0z"/></svg>';
var sidebar_visible = false;
var page_original = "";
var chart = "";
var chart_theme = "light2";

chrome.storage.sync.get(['color_scheme'], function(result) {
  switch(result.color_scheme) {
    case 'dark':
      chart_theme = 'dark2';
      break;
    case 'light':
      chart_theme = 'light2';
      break;
    default:
      chart_theme = 'dark2';
      break;
  }
});

/**
 * Sets up the sidebar structure and appends classes and information
 */
sidebar_element = document.createElement('div');
sidebar_content = document.createElement('div');
sidebar_slider = document.createElement('div');
sidebar_slider_img = document.createElement('img');
page_content = document.createElement('div');
sidebar_content.setAttribute('id', 'purple-sidebar');
sidebar_slider.setAttribute('id', 'purple-slider');
sidebar_element.setAttribute('class', 'purple-sidebar purple-sidebar-retracted');
sidebar_content.setAttribute('class', 'purple-content');
sidebar_slider.setAttribute('class', 'purple-slider');
sidebar_slider_img.setAttribute('src', chrome.runtime.getURL('images/get_started19_white.png'));
sidebar_slider_img.setAttribute('id', 'arrow');
page_content.innerHTML = document.body.innerHTML;
page_original = page_content.innerHTML;
document.body.innerHTML = "";
sidebar_element.appendChild(sidebar_content);
sidebar_element.appendChild(sidebar_slider);
document.body.appendChild(sidebar_element);
document.body.appendChild(page_content);
sidebar_slider.appendChild(sidebar_slider_img);
document.getElementById('arrow').setAttribute('class', 'arrow');

var custom_reader = document.createElement('div');
custom_reader.setAttribute('style', 'margin-left: 400px; minimum-height: 100vh');
page_content.style.minHeight = '100vh';
var page = "original";
var theme = "default";

particlesJS.load('particles-js', 'particles.json', function() {
  console.log('callback - particles.js config loaded');
});

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
      document.getElementById("logo").setAttribute('src', chrome.runtime.getURL('images/Landing_Page_Logo_White.png'));
      if (document.getElementById("switch-reader")) {
        document.getElementById("switch-reader").style.display = 'none';
        document.getElementById("switch-reader").addEventListener('click', function(){
          if (page == "original") {
            page_content.innerHTML = "";
            page_content.appendChild(custom_reader);
            sidebar_slider.style.marginLeft = '-60px';
            console.log('custom');
            page = "custom";
          } else if (page == "custom") {
            page_content.innerHTML = page_original;
            sidebar_slider.style.marginLeft = '-20px';
            console.log('original');
            page = "original";
          }
        });
      }
      document.getElementById("options-button").addEventListener('click', function(){
        chrome.tabs.create({ 'url': chrome.runtime.getURL('options.html') });
      });

      chrome.storage.sync.get(['color_scheme'], function(result) {
        switch(result.color_scheme) {
          default:
          case 'default':
            theme = 'default';
            document.body.style.backgroundColor = '#FFFFFF';
            document.getElementById("main-section").setAttribute('style', 'background-color:#32373A !important; color: white !important');
            relatedDark();
            custom_reader.setAttribute('style', 'margin-left: 400px; background-color: #FFFFFF; color: #000000');
            break;
          case 'dark':
            theme = 'dark';
            document.body.style.backgroundColor = '#32373A';
            document.getElementById("main-section").setAttribute('style', 'background-color:#32373A !important; color: white !important');
            relatedDark();
            custom_reader.setAttribute('style', 'margin-left: 400px; background-color: #32373A; color: #FFFFFF');
            break;
          case 'light':
            theme = 'light';
            document.body.style.backgroundColor = '#FFFFFF';
            document.getElementById("main-section").setAttribute('style', "background-color:#FFFFFF !important; color: black !important");
            relatedLight();
            sidebar_slider.setAttribute('style', 'filter: invert(1);');
            custom_reader.setAttribute('style', 'margin-left: 400px; background-color: #FFFFFF; color: #000000');
            break;
          

        }
      });
    });

/**
 * Upon pressing the slider, expand or retract based on current state
 */
document.getElementById("purple-slider").addEventListener("click", function(){
    if (sidebar_visible && page == "original") {
        sidebar_visible = !sidebar_visible;
        sidebar_element.setAttribute('class', 'purple-sidebar purple-sidebar-retracted');
        document.getElementById('arrow').setAttribute('class', 'arrow');
    } else if (page == "original") {
        sidebar_visible = !sidebar_visible;
        sidebar_element.setAttribute('class', 'purple-sidebar');
        document.getElementById('arrow').setAttribute('class', 'arrow arrow-retracted');
    }
});

function callback(stage, content) {
    switch(stage) {
        case -1:
            updateSummaryText("Uh no! We were not able to analyze this article :c");
            break;
        case 1:
            var negative = 0;
            var neutral = 0;
            var positive = 0;
            var general_sentiment = "none";
            var content_text = "";

            var header = document.createElement('h4');
            header.setAttribute('style', 'padding: 30px; margin: 0px; background-color: #7a32b2; color: white')
            header.innerHTML = document.title;
            custom_reader.appendChild(header);

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
    chart = new CanvasJS.Chart("sentimentChartContainer", {
      theme: chart_theme, 
      exportEnabled: false,
      animationEnabled: true,
      title: {
        text: "Sentiment Distribution"
      },
      data: [{
        type: "pie",
        startAngle: -90,
        toolTipContent: "<b>{label}</b>: {y}%",
        showInLegend: "true",
        legendText: "{label}",
        indexLabelFontSize: 16,
        indexLabel: "{label}",
        chartArea: {
          backgroundColor: '#FFFFFF'
        },
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

    if (theme == 'dark' || theme == 'default') {
      relatedDark();
    } else {
      relatedLight();
    }
  }

  function start() {
    console.log("hey");
    updateSentimentChart(0,0,0) // Pos, Neut, Negative
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

  function relatedDark() {
    var articles = document.getElementsByClassName("mdl-list__item");
    for (var i = 0; i < articles.length; i++) {
      articles[i].setAttribute('style', 'color: white !important');
    }
  }

  function relatedLight() {
    var articles = document.getElementsByClassName("mdl-list__item");
    for (var i = 0; i < articles.length; i++) {
      articles[i].setAttribute('style', 'color: black !important');
    }
  }

  function options() {
    chrome.tabs.create({ 'url': 'chrome:\/\/extensions/?options=' + chrome.runtime.id })
  }


