function summary(text, done) {
  keys = ["E46D0D070A", "0563936228", "76A40AB2ED", "8D9A0C1B83", "3D02122A11", "4EF7F66270", "6C31C51EB3", "7FA7728C55"]
  var random = keys[Math.floor(Math.random()*keys.length)]
  var url = `https://cors-anywhere.herokuapp.com/https://api.smmry.com/&SM_LENGTH=2&SM_API_KEY=${random}`
  
  var data = new FormData();
  data.append("sm_api_input", text);
  

  const Http = new XMLHttpRequest();
  Http.open("POST", url);
  Http.setRequestHeader("origin", "null")
  Http.setRequestHeader("x-requested-with", "null")
  Http.send(data);
  Http.onreadystatechange = function() {
    if(this.readyState==4 && this.status==200) {
      text_out = (JSON.parse(Http.responseText));
      done(text_out)
    }
  }
}

function get_related(keywords, done, base_url) {
  const Http = new XMLHttpRequest();
  keys = ["35f35e5d26cb4c80bf48079d5099a335", "56a6a3896f8c480a8dc4c08177f1f9f3", "ec85280265c142c88dec10bc1c0cb747"]
  var random = keys[Math.floor(Math.random()*keys.length)];
  var query = encodeURIComponent(keywords.join(" "));
  var url = `https://newsapi.org/v2/everything/?q=${query}&apikey=${random}`
  Http.open("GET", url);
  //Http.setRequestHeader("origin", "null")
  //Http.setRequestHeader("x-requested-with", "null")
  Http.send();

  Http.onreadystatechange = function() {
    if(this.readyState==4 && this.status==200) {
      var news_obj = JSON.parse(Http.responseText)
      var most_neg = undefined;
      var most_pos = undefined;
      var most_nut = undefined;

      let count = Math.min(9, news_obj.totalResults - 1);

      if(count == -1) {
        addNextArticles([{"name": "We couldn't find any articles similar to this.", "url": "#"}]);
        return
      }

      function onFinishedArticle() {
        count -= 1;
        if(count == 0) {
          done(most_neg, most_nut, most_pos);
        }
      }

      for(var i = 0; i < count; i++) {
        analyze_article(news_obj.articles[i].url, (stage, content, j) => {
          if(stage == -1) {
            onFinishedArticle();
            return;
          }
            var current = news_obj.articles[j];
            current.document_score = content.document_score;
            current.document_magnitude = content.document_magnitude;

            if (current.url != base_url && stage == 1) {
              if (most_neg === undefined) {
                most_neg = current;
                most_nut = current;
                most_pos = current;
              }
              else if (current.document_score < most_neg.document_score || (current.document_score == most_neg.document_score && current.document_magnitude > most_neg.document_magnitude)) {
                most_neg = current;
              } if (current.document_score > most_pos.document_score || (current.document_score == most_pos.document_score && current.document_magnitude > most_pos.document_magnitude)) {
                  most_pos = current;
              } if (Math.abs(current.document_score) <= Math.abs(most_nut.document_score) && current.document_magnitude >= most_nut.document_magnitude) {
                most_nut = current;
              } 
            }
            onFinishedArticle();
        }, false, i);
      }
    } else if (this.status == 200) {
      done(-1)
    }
  }
}

/**
 * 
 * @param {*} url url that we are currently at
 * @param {*} done function(stage, content) content depends on stage, stage 1 sentiment, stage 2 summary, stage 3 related
 * @param {*} do_related must be true don't question it
 */
function analyze_article(url, done, do_related, pass_thru) {
  if (do_related === undefined) {
    do_related = false;
  }
  base_url = url;
  const Http = new XMLHttpRequest();
  url_base='https://us-central1-hack-davis-2020-1579397355187.cloudfunctions.net/get-main-text?articleURL=';
  url = url_base + url;
  Http.open("GET", url);
  Http.send();
  text_out = "";

  Http.onreadystatechange = function() {
    if(this.readyState==4 && this.status==200) {
      text_out = (Http.responseText);
      Http.responseText = ""

      url = "https://us-central1-hack-davis-2020-1579397355187.cloudfunctions.net/analyze-sentiment?body=";
      const Http2 = new XMLHttpRequest();

      const data = {
        "text" : text_out
      }

      Http2.open("POST", url);
      Http2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      Http2.send(JSON.stringify(data));
      Http2.onreadystatechange = function() {
        if(this.readyState==4 && this.status==200) {
          var sentiment_obj = JSON.parse(Http2.responseText)
          done(1, sentiment_obj, pass_thru);
          var key_terms = [];
          for (var i = 0; i < 4; i++) {
            if (sentiment_obj.entities[i] === undefined) {
              break
            }
            key_terms.push((sentiment_obj.entities[i]).name);
          }
          if (do_related) {
            get_related(key_terms, (most_neg, most_nut, most_pos) => {
              if(most_neg === -1) {
                done(3, [undefined, undefined, undefined]);
              } else {
                done(3, [most_neg, most_nut, most_pos]);
              }
            }, base_url);
          }
        } else if(this.readyState==4) {
          done(-1)
        }
      }
      if (do_related) {
        summary(text_out, (result) => {
          done(2, result);
        })
      }
    } else if (this.readyState==4) {
      done(-1)
    }
  }
}

