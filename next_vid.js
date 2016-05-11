// Reloads the new page with a url given by the callback function
// Callback function takes current url as it's argument
function replaceUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {

    var tab = tabs[0];
    var url = tab.url;
    console.assert(typeof url == 'string', 'tab.url should be a string');
    var new_url = callback(url);

    if(url !== new_url)
    {
      var updateProperties = {
        "url": new_url
      };
      chrome.tabs.update(null, updateProperties); //update the url of the current tab
    }
  });
}


//checks whether the given url can be accessed
function checkPageExists(url){
  var reader = new XMLHttpRequest();
  reader.open('GET', url, false);
  var success = false;

  reader.onreadystatechange = function() {
    if (reader.readyState === 4) {
      //check to see whether request for the file failed or succeeded
      if ((reader.status == 200) || (reader.status == 0)) {
        success = true;
      }
    }
  }
  reader.send();
  return success;
}


// Get the next episode url from a given episode url
// Finds the episode number in the url and increments it
function getNextEpisode(url){
  //increment episode
  var next_episode_url = url.replace(/episode-(\d+)/gi, function(match, capture){
    var current_episode = parseInt(capture);
    current_episode++;
    return "episode-" + current_episode.toString();
  });

  //if link invalid, increment season
  if(next_episode_url !== url && checkPageExists(next_episode_url)){
    return next_episode_url;
  }
  else {
    next_episode_url = url.replace(/season-(\d+)-episode-\d+/gi, function(match, capture){
      var current_season = parseInt(capture);
      current_season++;
      return "season-" + current_season.toString() + "-episode-1";
    });
  }

  // if link invalid, return original url
  if(next_episode_url !== url && checkPageExists(next_episode_url)){
    return next_episode_url;
  }
  else{
    if (next_episode_url === url){
      alert("Badly formatted url, expected url to include 'season-N-episode-M'.");
  }
  else{
      alert("No more episodes!");
    }
    return url;
  }
}

// Run when extension button is clicked on
chrome.browserAction.onClicked.addListener(function(tab) {
  replaceUrl(getNextEpisode);
});