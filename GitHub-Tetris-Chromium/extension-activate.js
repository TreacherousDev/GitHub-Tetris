chrome.browserAction.onClicked.addListener((tab) => {
  const githubProfileRegex = /^https:\/\/github\.com\/[^\/]+\/?$/; // Matches GitHub profile URLs

  if (githubProfileRegex.test(tab.url)) {
    // Inject the Snake game script
    chrome.tabs.executeScript({
      file: "tetris.js"
    });
  } else {
    // Notify the user via a browser notification
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "GitHub Snake Game",
      message: "Please open a GitHub profile page to play Snake."
    });
  }
});
