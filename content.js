import { FETCH_SCORE_URL } from "./config";

const initialProcess = () => {
  const tracklist = document.querySelector(
    '[data-testid="playlist-tracklist"]'
  );

  if (!tracklist) return;
  const rows = tracklist.querySelectorAll('[data-testid="tracklist-row"]');

  for (const row of rows) {
    addReviewScoreToTrack(row);
  }
};

const addReviewScoreToTrack = async () => {
  const rows = tracklist.querySelectorAll('[data-testid="tracklist-row"]');

  for (const row of rows) {
    const tracklistRowLink = row.querySelector(
      '[data-testid="internal-track-link"]'
    );
    const albumName = tracklistRowLink.textContent.trim();

    const storedAlbum = await getAlbumScoreFromStorage(albumName);

    if (storedAlbum) {
      insertScore(row, result.score, result.link);
    } else {
      try {
        const fetchedAlbum = await fetchAlbumScore(albumName);

        if (fetchedAlbum) {
          saveAlbumScoreToStorage(
            albumName,
            fetchedAlbum.score,
            fetchedAlbum.link
          );
          insertScore(row, fetchedAlbum.score, fetchedAlbum.link);
        }
      } catch (error) {
        console.error("Error fetching album score:", error);
      }
    }
  }
};

const fetchAlbumScore = async (albumName) => {
  const response = await fetch(
    `${FETCH_SCORE_URL}/${encodeURIComponent(albumName)}`
  );

  if (response.ok) {
    const { score, link } = await response.json();
    return { score, link };
  }

  return null;
};

const insertScore = (row, score, link) => {
  const scoreElement = document.createElement("a");
  scoreElement.href = link;
  scoreElement.textContent = `Score: ${score}`;
  scoreElement.style.marginLeft = "8px";
  row
    .querySelector('[role="gridcell"][aria-colindex="5"]')
    .appendChild(scoreElement);
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
        if (
          node.nodeType === Node.ELEMENT_NODE &&
          node.matches('[data-testid="tracklist-row"]')
        ) {
          addReviewScoreToTrack(node);
        }
      }
    }
  }
};

const observer = new MutationObserver(observerCallback);

const init = () => {
  checkTracklist();
  observer.observe(document.body, { childList: true, subtree: true });
};

init();
