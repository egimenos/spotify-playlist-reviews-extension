# Chrome Extension for Spotify Album Scores

This Chrome extension enhances the Spotify web player experience by displaying albums scores and links to the reviews (currently only from https://pitchfork.com/) directly on the track list. The extension is built using Chrome Manifest V3.

This is just a small personal project intended for personal use and self-learning, which relies on this backend to be deployed: https://github.com/egimenos/albums-reviews

## Features

- Displays Pitchfork review scores and links for albums on the Spotify web player
- Works only on the `https://open.spotify.com/` domain
- Automatically updates the track list when scrolling
- Caches API results to minimize unnecessary calls

## Installation

1. Clone this repository or download the source code as a ZIP file and extract it.
2. Open the Chrome browser and navigate to `chrome://extensions/`.
3. Add the endpoint url to `config.js`

```js
  window.spotifyScoresConfig = {
    FETCH_SCORE_URL: "https://your-backend.dev",
  };
})();
```

4. Turn on "Developer mode" by toggling the switch in the upper right corner.
5. Click the "Load unpacked" button and select the folder containing the source code of the extension.

The extension should now be installed and active in your Chrome browser.

## Usage

Navigate to the Spotify web player at `https://open.spotify.com/`. The extension will automatically display review scores and links for albums in the track list. The scores and links will update when you scroll or navigate to different pages within the web player.

Currently only works in pages that renders an element with `data-testid="playlist-tracklist"`

## Configuration

The API endpoint URL is stored in the `config.js` file. You can change the URL by updating the value of the `API_ENDPOINT` constant.

## Contributing

If you want to contribute to this project, feel free to fork the repository, create a feature branch, and submit a pull request. We appreciate any feedback and contributions!

<a href="https://www.flaticon.com/free-icons/spotify" title="spotify icons">Spotify icons created by Freepik - Flaticon</a>

![image](https://user-images.githubusercontent.com/18742365/232550382-c8dbc64a-ed6c-467b-a5a7-a8c8471d68d6.png)

