import { playItem } from './webPlayer.js'; 
let accessToken = null;

export function setupSearch(accessTokenValue) {
  accessToken = accessTokenValue;

  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  searchInput.style.display = 'block';
  let timer;

  searchInput.addEventListener('input', (e) => {
    if (e.target.value) {
      searchResults.style.border = '1px solid #ccc';
    } else {
      searchResults.style.border = 'none';
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      searchSpotify(e.target.value);
    }, 500);
  });
}

async function refreshToken() {
  try {
    const response = await fetch(`https://podify-backend.onrender.com/refresh_token?refresh_token=${localStorage.getItem('refresh_token')}`);
    const data = await response.json();
    accessToken = data.access_token;
    localStorage.setItem('access_token', accessToken);
  } catch (error) {
    console.error('Error refreshing token:', error);
  }
}

async function searchSpotify(query) {
  const searchEndpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist,show,episode,track&limit=5`;
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  try {
    let response = await fetch(searchEndpoint, { headers: headers });
    
    // If token expired (status 401), refresh and retry
    if (response.status === 401) {
      await refreshToken();
      response = await fetch(searchEndpoint, { headers: headers });
    }

    const data = await response.json();
    let trackResults = [];
    let artistResults = [];
    let episodeResults = [];
    let showResults = [];

    // Extract and structure data for tracks
    if (data.tracks && data.tracks.items) {
      trackResults = data.tracks.items.map(item => ({
          type: 'track',
          id: item.id,
          name: item.name,
          image: item.album.images[0].url,
          popularity: item.popularity
      }));
    }

    // Extract and structure data for artists
    if (data.artists && data.artists.items) {
      artistResults = data.artists.items.map(item => ({
          type: 'artist',
          id: item.id,
          name: item.name,
          image: item.images[0] ? item.images[0].url : null,
          popularity: item.popularity
      }));
    }
    
    if (data.episodes && data.episodes.items) {
      episodeResults = data.episodes.items.map(item => ({
          type: 'episode',
          id: item.id,
          name: item.name,
          image: item.images[0].url
      }));
    }
    if (data.shows && data.shows.items) {
      showResults.push(...data.shows.items.map(item => ({
        type: 'show',
        id: item.id,
        name: item.name,
        image: item.images[0]?.url || '',
      })));
    }
//     if (data.artists && data.artists.items) {
//   artistResults.push(...data.artists.items.map(item => ({
//     type: 'artist',
//     id: item.id,
//     name: item.name,
//     image: item.images[0]?.url || '', // Use the first image or an empty string as a fallback
//   })));
// }///zzz


    // Sort tracks and artists by popularity
    trackResults.sort((a, b) => b.popularity - a.popularity);
    artistResults.sort((a, b) => b.popularity - a.popularity);

    // Combine the results in desired order
    const results = [...showResults,...trackResults, ...artistResults, ...episodeResults];

    // Call the displayResults function with the search results
    displayResults(results);
    
    return results;
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return [];
  }
}


function displayResults(results) {
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.innerHTML = '';

  const episodeResults = results.filter(result => result.type === 'episode');
  const trackResults = results.filter(result => result.type === 'track');
  const artistResults = results.filter(result => result.type === 'artist');
  const showResults = results.filter(result => result.type === 'show');

if (artistResults.length > 0) {
  const geniusHeader = document.createElement('h2');
  geniusHeader.textContent = 'Geniuses';
  geniusHeader.classList.add('resultHeader');
  resultsContainer.appendChild(geniusHeader);

  artistResults.forEach(result => appendResultToContainer(result, resultsContainer));
}

if (showResults.length > 0) {
  const mogulHeader = document.createElement('h2');
  mogulHeader.textContent = 'Moguls';
  mogulHeader.classList.add('resultHeader');
  resultsContainer.appendChild(mogulHeader);

  showResults.forEach(result => appendResultToContainer(result, resultsContainer));
}
  if (episodeResults.length > 0) {
    const podHeader = document.createElement('h2');
    podHeader.textContent = 'Pods';
    podHeader.classList.add('resultHeader');
    resultsContainer.appendChild(podHeader);

    episodeResults.forEach(result => appendResultToContainer(result, resultsContainer));
  }

  if (trackResults.length > 0) {
    const bangerHeader = document.createElement('h2');
    bangerHeader.textContent = 'Bangers';
    bangerHeader.classList.add('resultHeader');
    resultsContainer.appendChild(bangerHeader);

    trackResults.forEach(result => appendResultToContainer(result, resultsContainer));
  }
}

function appendResultToContainer(result, container) {
  const resultElement = document.createElement('div');
  resultElement.className = 'resultItem';
  resultElement.dataset.id = result.id;
  resultElement.dataset.type = result.type;
  resultElement.dataset.name = result.name;
  resultElement.dataset.image = result.image;
  resultElement.innerHTML = `<img src="${result.image}" alt="${result.name}"/> ${result.name}`;
  resultElement.addEventListener('click', handleResultClick);
  container.appendChild(resultElement);
}


async function handleResultClick(e) {
  const type = e.currentTarget.dataset.type;
  const id = e.currentTarget.dataset.id;

  if (type === 'artist') {
    await getArtistTopTracks(id);
  } else if (type === 'show') {
    await getShowEpisodes(id);
  } else if (type === 'track' || type === 'episode') {
    // Hide search results dropdown only when a track or episode is chosen
    const searchResults = document.getElementById('searchResults');
    searchResults.style.display = 'none';
    
    playItem(id, type);
  }
}




async function getArtistTopTracks(artistId) {
  const topTracksEndpoint = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`;
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  try {
    let response = await fetch(topTracksEndpoint, { headers: headers });

    if (response.status === 401) {
      await refreshToken();
      response = await fetch(topTracksEndpoint, { headers: headers });
    }

    const data = await response.json();
    const topTracks = data.tracks.map(track => ({
      type: 'track',
      id: track.id,
      name: track.name,
      image: track.album.images[0].url,
    }));

    displayResults(topTracks);

  } catch (error) {
    console.error('Error getting artist top tracks:', error);
  }
}


async function getShowEpisodes(showId) {
  const episodesEndpoint = `https://api.spotify.com/v1/shows/${showId}/episodes?market=US&limit=5`;
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  try {
    let response = await fetch(episodesEndpoint, { headers: headers });

    if (response.status === 401) {
      await refreshToken();
      response = await fetch(episodesEndpoint, { headers: headers });
    }

    const data = await response.json();
    const episodes = data.items.map(episode => ({
      type: 'episode',
      id: episode.id,
      name: episode.name,
      image: episode.images[0].url,
    }));

    displayResults(episodes);

  } catch (error) {
    console.error('Error getting show episodes:', error);
  }
}


