const { FETCH_SCORE_URL } = window.spotifyScoresConfig;

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

      if (fetchedAlbum) {
        saveAlbumScoreToStorage(
          albumName,
          fetchedAlbum.score,
          fetchedAlbum.link
        );
      }
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
        resolve(result[albumName]);
      }
    });
  });
};

const saveAlbumScoreToStorage = (albumName, score, link) => {
  chrome.storage.local.set({ [albumName]: { score, link } });
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
