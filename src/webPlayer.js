

let currentAccessToken = null;
let currentSpotifyUri = null;

export function setupWebPlayer(accessToken) {
    currentAccessToken = accessToken;


    // Adding event listener to the Spotify logo
    const spotifyLogo = document.getElementById('spotifyLogo');
    spotifyLogo.addEventListener('click', redirectToSpotify);

    // Fetch and update the current playing song after user logs in
    fetchCurrentPlaying();
}

function redirectToSpotify() {
    if (currentSpotifyUri) {
        const spotifyURL = `https://open.spotify.com/${currentSpotifyUri.split(':').slice(1).join('/')}`;
        window.open(spotifyURL, '_blank');
    } else {
        console.error('No track is currently being played.');
    }
}


async function fetchWithRetry(endpoint, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(endpoint, options);
            if (response.ok) return response;
            if (i === maxRetries - 1) throw new Error('Max retries reached');
        } catch (err) {
            console.error(`Attempt ${i + 1} failed. Retrying...`);
            await new Promise(res => setTimeout(res, 2000)); // wait for 2 seconds
        }
    }
}

export async function playItem(itemId, itemType) {
    const endpoint = `https://api.spotify.com/v1/me/player/play`;
    const headers = {
        'Authorization': `Bearer ${currentAccessToken}`,
        'Content-Type': 'application/json',
    };
    
    let body;

    // This part identifies the type of item and prepares the body for the play request.
    // It also updates the currentSpotifyUri variable with the URI of the current item.
    if (itemType === 'track' || itemType === 'episode') {
        currentSpotifyUri = `spotify:${itemType}:${itemId}`;
        body = {
            uris: [currentSpotifyUri],
        };
    } else {
        currentSpotifyUri = `spotify:${itemType}:${itemId}`;
        body = {
            context_uri: currentSpotifyUri,
        };
    }

    try {
        const response = await fetchWithRetry(endpoint, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("Play response:", errorBody);
            throw new Error(`Unable to play ${itemType}: ${response.statusText}`);
        }

    } catch (error) {
        console.error('Error in web player:', error);
        handlePlaybackError(error);
    }
    
    const selectedItem = Array.from(document.getElementById('searchResults').children).find(item => item.dataset.id === itemId);
    if (selectedItem) {
        const currentImage = document.getElementById('currentImage');
        currentImage.src = selectedItem.dataset.image;
        document.getElementById('currentTitle').textContent = selectedItem.dataset.name;
        currentImage.style.display = 'block';  // Show the image
    }
}
async function fetchCurrentPlaying(retries = 3) {
    const endpoint = `https://api.spotify.com/v1/me/player`; 
    const headers = {
        'Authorization': `Bearer ${currentAccessToken}`,
        'Content-Type': 'application/json',
    };

    if (retries <= 0) {
        console.warn("Max retries reached. Unable to fetch currently playing track.");
        return;
    }

    try {
        const response = await fetchWithRetry(endpoint, { headers: headers });
        if (response.ok) {
            const text = await response.text();
            if (text) {
                try {
                    const data = JSON.parse(text);
                    updateCurrentPlaying(data);
                } catch (e) {
                    console.error("Failed to parse JSON. Response text:", text);
                    throw e;
                }
            } else {
                console.warn("No track is currently playing or the response is empty. Retrying...");
                setTimeout(() => fetchCurrentPlaying(retries - 1), 2000);  // retry after 2 seconds
            }
        } else {
            const text = await response.text();
            console.error("Error response:", text);
        }
    } catch (error) {
        console.error('Error fetching current playing:', error);
    }
}


function updateCurrentPlaying(data) {
    if (data && data.item) {
        const track = data.item;
        currentSpotifyUri = track.uri;

        // Set the src. The load event will trigger once the image is loaded.
        currentImage.src = track.album.images[0].url;

        document.getElementById('currentTitle').textContent = track.name;
    } else {
        console.warn('No track is currently being played.');
    }
}



let spotifySDKReady = new Promise((resolve) => {
    window.onSpotifyWebPlaybackSDKReady = () => {
        resolve();
    };
});

export async function checkWebPlaybackSDKCompatibility() {
    await spotifySDKReady;  // wait for the SDK to be ready
    return window.Spotify?.Player?.isSupported() ?? false;
}

function handlePlaybackError(error) {
    console.error('Web Playback SDK error:', error);
    if (error.message.includes("Max retries reached")) {
        alert('There seems to be a connection issue with Spotify. Please try again in a few moments.');
    } else if(error.message.includes("Playback cannot be started from this context")) {
        alert('Cannot play this item. Please choose another.');
    } else {
        alert('Playback error. Please try again later.');
    }
}

//testsssss
