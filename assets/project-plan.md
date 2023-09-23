# Podify: Elevate Your Listening Experience

## Background
Podify is a simple Single Page Application (SPA) designed to elevate your auditory experience. This platform seamlessly combines three primary elements:

- Search Bar
- Web Player
- Live Transcription

Upon logging into their Spotify account, users can select their desired content and watch the playback live on the webpage. The intuitive search bar offers auto-population features based on Spotify's vast library. The SPA ensures that the content is delivered via a sleek, minimal custom player.

Adjacent to the player, users can access a live transcription of the chosen content's audio. To harness the full capabilities of Podify, users must keep the webpage active throughout the playback. Once the content concludes, a summarised transcription will be delivered to the user's inbox.

## Functionality & MVPs
With Podify, users can:

- **Search**: Easily find any piece of content available to the logged-in user.
- **Playback**: Immerse in content through a custom media player directly within the webpage.
- **Live Transcription**: Witness real-time transcription of the audio playback.
- **Summary Delivery**: Receive a content summary post playback.

## Wireframes

<p align="left" style="padding-top: 50px; padding-bottom: 50px;"> 
    <img src="assets/wireframe.png" alt="show-page" width="500"/>
</p>


- The user-friendly search bar at the top connects to Spotify’s vast media library, offering real-time suggestions.
- The custom media player ensures a hassle-free content consumption experience.
- Users can opt to receive their summaries via email post playback.
- Live transcription is displayed on the right, allowing users to read as they watch.

## Technologies, Libraries, APIs
Podify leverages cutting-edge tools and platforms:

- **Modern Browser**: Particularly Chrome, suitable for capturing media (sound out of a tab).
- **Recorder.js**: Converts audio into files compatible with the speech-to-text API.
- **Whisper API**: Transforms speech into text.
- **Render**: Hosts our proxy server.
- **GPT-4**: Summarizes transcriptions efficiently.

## Implementation Timeline

**Note**:

- **Friday Afternoon & Weekend**: Setup - Ensure that I can get all the information I need from the Spotify API, setup my proxy backend_server in render, build out the webplayer and Spotify elements.
- **Monday**: Works on the recorder.js integration to ensure I can capture the audio that being played back on my browser, work on the data pipeline to the Whisper API
- **Tuesday**: Integrate the transcription piece of the website and the GPT 4 summarization piece.
- **Wednesday**: implement emailing the summaries to the user after audio playback.
- **Thursday Morning**: Polish up and ensure the UI is perfect, everything works as expected in github pages.

## Bonus Features
Podify's evolutionary journey includes potential additions:

- **Email Integration**: Direct summaries to user inboxes.
- **SMS Integration**: Deliver summaries via SMS.
- **Podcast Integration**: Access to the top 50 podcasts and user summaries (would necessitate a backend).