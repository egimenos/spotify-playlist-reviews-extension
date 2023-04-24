const { FETCH_SCORE_URL } = window.spotifyScoresConfig;
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 10000; // 10 days cache expiration

const initialProcess = () => {
  const tracklist = document.querySelector(
    '[data-testid="playlist-tracklist"]'
  );

  if (!tracklist) return;

  addScoreToHeader();

  const rows = tracklist.querySelectorAll('[data-testid="tracklist-row"]');

  for (const row of rows) {
    addReviewScoreToTrack(row);
  }
};

const addReviewScoreToTrack = async (row) => {
  const albumLink = row.querySelector('a[href^="/album"]');

  const albumName = albumLink.textContent.trim();

  const storedAlbum = await getAlbumScoreFromStorage(albumName);

  if (storedAlbum) {
    insertScore(row, storedAlbum.score, storedAlbum.link);
  } else {
    try {
      const fetchedAlbum = await fetchAlbumScore(albumName);

      saveAlbumScoreToStorage(
        albumName,
        fetchedAlbum?.score || null,
        fetchedAlbum?.link || null
      );

      insertScore(row, fetchedAlbum?.score, fetchedAlbum?.link);
    } catch (error) {
      console.error("Error adding review score:", error);
    }
  }
};

const fetchAlbumScore = async (albumName) => {
  try {
    const response = await fetch(
      `${FETCH_SCORE_URL}/albums/${encodeURIComponent(albumName)}`
    );

    if (response.ok) {
      const { score, link } = await response.json();
      return { score, link };
    }

    return null;
  } catch (error) {
    console.error("Error fetching album score", error);
  }
};

const insertScore = (row, score, link) => {
  const scoreElement = document.createElement("div");

  const linkElement = document.createElement("a");
  linkElement.href = link;
  linkElement.target = "_blank";
  linkElement.textContent = score || "";
  scoreElement.appendChild(linkElement);

  if (score) {
    scoreElement.setAttribute("id", "score-wrapper");
  }

  const firstGridCell = row.querySelector(
    '[role="gridcell"][aria-colindex="1"]'
  );

  firstGridCell.replaceChildren(scoreElement);
};

const addScoreToHeader = () => {
  const columnHeaders = document.querySelectorAll('[role="columnheader"]');

  const firstColumnHeader = columnHeaders[0];

  firstColumnHeader.replaceChildren("Score");
};
const getAlbumScoreFromStorage = (albumName) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([albumName], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        const storedAlbum = result[albumName];
        if (
          storedAlbum &&
          Date.now() - storedAlbum.timestamp < CACHE_EXPIRATION_TIME
        ) {
          resolve(storedAlbum);
        } else {
          resolve(null);
        }
      }
    });
  });
};

const saveAlbumScoreToStorage = (albumName, score, link) => {
  const timestamp = Date.now();
  chrome.storage.local.set({ [albumName]: { score, link, timestamp } });
};

const clearStorage = () => {
  chrome.storage.local.clear((_result) => {
    if (chrome.runtime.lastError) {
      console.error("Error clearing storage:", chrome.runtime.lastError);
    } else {
      console.log("Storage cleared successfully");
    }
  });
};

const observerCallback = async (mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      for (const node of mutation.addedNodes) {
        const row = node.querySelector('[data-testid="tracklist-row"]');
        if (row) {
          addReviewScoreToTrack(row);
        }
      }
    }
  }
};

const observer = new MutationObserver(observerCallback);

const init = () => {
  console.log("### Starting spotify-reviews extension");
  initialProcess();
  observer.observe(document.body, { childList: true, subtree: true });
};
window.onload = function () {
  init();
};
