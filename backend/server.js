const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// YouTube URL for the lofi stream
const LOFI_URL = 'https://www.youtube.com/watch?v=jfKfPfyJRdk';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Lofi streaming server is running' });
});

// Get stream info
app.get('/api/stream-info', async (req, res) => {
  try {
    const info = await ytdl.getInfo(LOFI_URL);
    const title = info.videoDetails.title;
    const description = info.videoDetails.description;
    const thumbnail = info.videoDetails.thumbnails[0]?.url;
    
    res.json({
      title,
      description: description.substring(0, 200) + '...',
      thumbnail,
      url: LOFI_URL
    });
  } catch (error) {
    console.error('Error getting stream info:', error);
    res.status(500).json({ error: 'Failed to get stream information' });
  }
});

// Stream audio endpoint
app.get('/api/stream', async (req, res) => {
  try {
    // Set headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Get video info and find audio format
    const info = await ytdl.getInfo(LOFI_URL);
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    
    if (audioFormats.length === 0) {
      return res.status(404).json({ error: 'No audio formats found' });
    }
    
    // Stream the audio
    const stream = ytdl(LOFI_URL, {
      quality: 'highestaudio',
      filter: 'audioonly'
    });
    
    stream.pipe(res);
    
    stream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Stream error' });
      }
    });
    
  } catch (error) {
    console.error('Error starting stream:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to start stream' });
    }
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🎵 Lofi streaming server running on port ${PORT}`);
  console.log(`🌐 Stream URL: http://localhost:${PORT}/api/stream`);
});
