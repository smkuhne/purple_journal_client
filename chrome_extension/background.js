// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const default_values = {color_scheme:'default', sidebar_width: 100, sidebar_font_size:100}

'use strict';

chrome.runtime.onInstalled.addListener(function(details) {
  console.log(details);
  chrome.storage.sync.set(default_values, function() {
  });
});


  
