// Description: The main JavaScript file for the Podify web app.
import { setupSearch } from './searchBar.js';
import { setupWebPlayer, checkWebPlaybackSDKCompatibility } from './webPlayer.js';
// import { initializeAudioCapture } from './audioCapture.js';


let updateSeekBarInterval;  // Declare the variable at a scope accessible by all your functions
let accessToken; // Move the declaration of accessToken to a higher scope
let player;  // Declare the player variable at a scope accessible by all your functions
let isPlaying = false;  // To track playback state
let currentPosition = 0;  // To track the current position of the track
let trackDuration = 0;  // To track the duration of the track//

// Function to get user's Spotify profile
function getUserProfile(token) {
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    fetch('https://api.spotify.com/v1/me', { headers: headers })
        .then(response => response.json())
        .then(data => {
            const username = data.display_name;
            renderUsername(username);
        })
        .catch(error => {
            console.error('Error fetching user profile:', error);
        });
}

// Function to render the user's name
function renderUsername(username) {
    const usernameElement = document.getElementById('username');
    usernameElement.textContent = username;
}

// Playback control functions
function togglePlay() {
    var playSVG = `
        <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="25" r="23" stroke="black" stroke-width="2" fill="none"/>
            <path d="M 20 15 L 20 35 L 35 25 L 20 15" fill="black"/>
        </svg>
    `;

    var pauseSVG = `
        <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="25" r="23" stroke="black" stroke-width="2" fill="none"/>
            <rect x="18" y="15" width="5" height="20" fill="black"/>
            <rect x="27" y="15" width="5" height="20" fill="black"/>
        </svg>
    `;

    if (isPlaying) {
        player.pause().then(() => {
            isPlaying = false;
            document.getElementById('playPause').innerHTML = playSVG;
            clearInterval(updateSeekBarInterval);  // Stop updating the seek bar
        });
    } else {
        player.resume().then(() => {
            isPlaying = true;
            document.getElementById('playPause').innerHTML = pauseSVG;
            updateSeekBarInterval = setInterval(updateSeekBar, 1000);  // Resume updating the seek bar
        });
    }
}



function rewindTrack() {
    player.getCurrentState().then(state => {
        if (state) {
            const newPosition = Math.max(state.position - 15000, 0); // ensure position is not negative
            player.seek(newPosition).then(() => {
            });
        }
    });
}

function fastForwardTrack() {
    player.getCurrentState().then(state => {
        if (state) {
            const newPosition = state.position + 15000;
            player.seek(newPosition).then(() => {
            });
        }
    });
}
let isMuted = false;  // This variable will track if the audio is muted or not

function toggleMute() {
    if (isMuted) {
        player.setVolume(0.5).then(() => {
            document.getElementById('mute').innerText = "Mute";  // Update button text
        });
    } else {
        player.setVolume(0.001).then(() => {
            document.getElementById('mute').innerText = "Unmute";  // Update button text
        });
    }
    isMuted = !isMuted;  // Toggle the isMuted variable
}

// Attach the function to your button
document.getElementById('mute').addEventListener('click', toggleMute);


//test
function onSuccessfulLogin() {
    // Display the current image, Spotify logo, and web player
    // document.getElementById('currentImage').style.display = 'block';
    const currentImage = document.getElementById('currentImage');
    currentImage.addEventListener('load', function() {
        this.style.display = 'block';
    });
    
    document.getElementById('spotifyLogo').style.display = 'block'; // changed to getElementById
    document.getElementById('webPlayer').style.display = 'flex';
    
    // For elements with class, use querySelector
    document.querySelector('.playerControls').style.display = 'flex'; 
    document.querySelector('.playerControls button').style.display = 'flex'; 
    
    document.getElementById('seekBarContainer').style.display = 'flex';
    document.getElementById('currentTime').style.display = 'block'; // removed '#'
    document.getElementById('totalTime').style.display = 'block'; // corrected capitalization to match HTML ID
    document.getElementById('transcriptionBox').style.display = 'block';
    document.getElementById('mute').style.display = 'flex';
    document.getElementById('muteContainer').style.display = 'flex';
    document.getElementById('extensionInstructions').style.display = 'block';
    
    
    // Removed the line for '.player-controls' as it doesn't match any class in the provided HTML.
    //test
}

// Initialize all event listeners
function initializeEventListeners() {
    // Login button event
    const loginButton = document.getElementById('loginButton');
    loginButton.addEventListener('click', () => {
        window.location.href = 'https://podify-backend.onrender.com/login';
    });

    // Search input events
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    searchInput.addEventListener('input', () => {
        if (searchInput.value.length > 0) {
            searchResults.style.display = 'block';
        } else {
            searchResults.style.display = 'none';
        }
    });

    searchInput.addEventListener('focus', (event) => {
        event.preventDefault();
    });

    // Player control events
    document.getElementById('playPause').addEventListener('click', togglePlay);
    document.getElementById('rewind').addEventListener('click', rewindTrack);
    document.getElementById('fastForward').addEventListener('click', fastForwardTrack);
    document.getElementById('mute').addEventListener('click', toggleMute);

    // initializeAudioCapture();  
}

//test
// The main code that runs when the window loads
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);

    if (hashParams.has('access_token')) {
        document.getElementById('loginButton').style.display = 'none';  // Hide the login button

        accessToken = hashParams.get('access_token'); 
        const tokenType = hashParams.get('token_type');
        const expiresIn = hashParams.get('expires_in');
        const searchContainer = document.getElementById('search-container');
        searchContainer.style.display = 'block';

        getUserProfile(accessToken);
        setupSearch(accessToken);
        if (checkWebPlaybackSDKCompatibility()) {
            setupWebPlayer(accessToken);
        } else {
            alert("Device not suitable for playback");
        }
        onSuccessfulLogin();
    }
});

window.onSpotifyWebPlaybackSDKReady = () => {
    player = new Spotify.Player({
        name: 'Your Web Player Name',
        getOAuthToken: callback => {
            callback(accessToken);
        }
    });

    player.addListener('player_state_changed', state => {
        if (state) {
            const trackDuration = state.track_window.current_track.duration_ms;
            const currentPosition = state.position;
    
            document.getElementById('seekBar').max = trackDuration;
            document.getElementById('seekBar').value = currentPosition;
    
            // Update the time display
            document.getElementById('currentTime').textContent = formatTime(currentPosition);
            document.getElementById('totalTime').textContent = formatTime(trackDuration);
        }
        isPlaying = !state.paused;
        if (isPlaying) {
            document.getElementById('playPause').innerHTML =  `<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
                <circle cx="25" cy="25" r="23" stroke="black" stroke-width="2" fill="none"/>
                <rect x="18" y="15" width="5" height="20" fill="black"/>
                <rect x="27" y="15" width="5" height="20" fill="black"/></svg>`;
        } else {
            document.getElementById('playPause').innerHTML =  `<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
                <circle cx="25" cy="25" r="23" stroke="black" stroke-width="2" fill="none"/>
                <path d="M 20 15 L 20 35 L 35 25 L 20 15" fill="black"/></svg>`;
        }
    });

    player.addListener('ready', ({ device_id }) => {

        updateSeekBarInterval = setInterval(updateSeekBar, 1000);  // Update the seek bar every second

        // Set the device_id as the active playback device immediately.
        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        };

        fetch('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify({
                device_ids: [device_id],
                // play: true
            }),
        }).then(response => {
            if (!response.ok) {
                console.error('Error setting active device:', response.statusText);
            }
        });
    });
  
    player.connect();
};

document.getElementById('webPlayer').style.display = 'block';

document.getElementById('seekBar').addEventListener('input', (e) => {
    const newPosition = e.target.value; // This will be in milliseconds
    player.seek(newPosition).then(() => {
    });
});

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updateSeekBar() {
    player.getCurrentState().then(state => {
        if (state) {
            const currentPosition = state.position;
            document.getElementById('seekBar').value = currentPosition;
            document.getElementById('currentTime').textContent = formatTime(currentPosition);
        }
    });
}

document.getElementById('currentTime').textContent = formatTime(currentPosition);
document.getElementById('totalTime').textContent = formatTime(trackDuration);
document.addEventListener("DOMContentLoaded", function() {
    // Parse the URL's query parameters
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');

    if (accessToken) {
        fetchUserProfile(accessToken).then(userProfile => {
            if (userProfile.product !== 'premium') {
                alert('Please upgrade to premium to use this app.');
                window.location.href = 'https://www.spotify.com';
            } else {
                // Handle the logic for premium users (like setting up the web player, etc.)
                setupWebPlayer(accessToken);
                // Note: Ensure that "setupWebPlayer" function exists and is properly defined in your code.
            }
        }).catch(error => {
            console.error("Error fetching user profile:", error);
            alert('There was an error fetching your Spotify profile.');
        });
    }
});

function fetchUserProfile(accessToken) {
    return new Promise((resolve, reject) => {
        fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        }).then(response => response.json()).then(data => {
            resolve(data);
        }).catch(error => {
            reject(error);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Other JavaScript logic if any...

    const evtSource = new EventSource("https://podify-backend.onrender.com/transcription-updates");

    evtSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        const transcriptionBox = document.getElementById('transcriptionBox');
        
        // Append the new transcription to the existing content
        transcriptionBox.value += data + "\n"; // Adding a newline for separation
        transcriptionBox.scrollTop = transcriptionBox.scrollHeight; // Scroll to the bottom
    }
});

const transcriptionBox = document.getElementById('transcriptionBox');

transcriptionBox.addEventListener('input', function() {
    if (transcriptionBox.value.length > 0) {
        transcriptionBox.style.height = "25vh"; // 25% of the viewport height
    } else {
        transcriptionBox.style.height = "initial";
    }
});

let lastScrollTop = 0;

window.addEventListener("scroll", function() {
   let currentScroll = window.scrollY;
   if (currentScroll > lastScrollTop){
       // Scrolling down
       document.getElementById("footer").style.transform = 'translateY(100%)';
   } else {
       // Scrolling up
       document.getElementById("footer").style.transform = 'translateY(0)';
   }
   lastScrollTop = currentScroll;
}, false);


// Initialize the event listeners
initializeEventListeners();

