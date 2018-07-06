$(document).ready(function() {
  fireAJAX();

  function fireAJAX() {
    $.ajax({
      type: 'POST',
      url: '/search',
      beforeSend: function(xhr) {
        $('.totalSentiment-results').html('');
        $('.results').show();
        enableState();
      },
      success: parseData,
      error: oops
    });
  }

  function parseData(data) {
    disableState();
    var totalSentimentResultsHtml ='';
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        var _config = {
          searchText: d.searchText,
          score: d.totalSentiment,
          comparative: d.totalComparative,
          numTweets: d.numTweets,
        };

        totalSentimentResultsHtml += tmpl('totalSentimentResults_tmpl', _config);
    }
    $('.totalSentiment-results').html(totalSentimentResultsHtml);
  }

  function oops(data) {
    $('.error').show();
    disableState();
  }

  function disableState() {
    $('.loading').hide();
  }

  function enableState() {
    $('.loading').show();
  }
});

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function() {
  var cache = {};

  this.tmpl = function tmpl(str, data) {
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
      tmpl(document.getElementById(str).innerHTML) :

    // Generate a reusable function that will serve as a template
    // generator (and which will be cached).
    new Function("obj",
      "var p=[],print=function(){p.push.apply(p,arguments);};" +

      // Introduce the data as local variables using with(){}
      "with(obj){p.push('" +

      // Convert the template into pure JavaScript
      str
      .replace(/[\r\t\n]/g, " ")
      .split("{{").join("\t") // modified
      .replace(/((^|\}\})[^\t]*)'/g, "$1\r") // modified
      .replace(/\t=(.*?)}}/g, "',$1,'") // modified
      .split("\t").join("');")
      .split("}}").join("p.push('") // modified
      .split("\r").join("\\'") + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn(data) : fn;
  };
})();
