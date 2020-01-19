// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const default_values = {color_scheme:'default', sidebar_width: 100, sidebar_font_size:100}

'use strict';


chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set(default_values, function() {
  });
  chrome.tabs.create({url: "welcome.html"}, function (tab) {
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'developer.chrome.com'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });

});


  
