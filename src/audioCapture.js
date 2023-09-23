async function fetchTranscription() {
    try {
        const response = await fetch('https://podify-backend.onrender.com/transcribe');
        const data = await response.json();

        // Display the data
        if (data.transcript) {
            displayTranscription(data);
        } else {
            // Handle errors or unexpected response format
            console.error('Failed to get transcription.');
        }
    } catch (error) {
        console.error('Error fetching transcription:', error);
    }
}




function displayTranscription(result) {
    const transcriptionBox = document.getElementById('transcriptionBox');
    if (result && result.transcript) {
        transcriptionBox.value = result.transcript;
    } else {
        transcriptionBox.value = "Failed to get transcription.";
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeAudioCapture();
});







