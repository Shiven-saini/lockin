const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend build directory if it exists
try {
  const frontendBuildPath = path.join(__dirname, '../frontend/build');
  const staticFileMiddleware = express.static(frontendBuildPath);
  app.use(staticFileMiddleware);
  console.log(`Serving frontend static files from ${frontendBuildPath}`);
} catch (error) {
  console.log('Frontend build directory not found - development mode');
}

// YouTube URL for the lofi stream
const LOFI_URL = 'https://www.youtube.com/watch?v=jfKfPfyJRdk';

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Lofi streaming server is running',
    endpoints: {
      health: '/api/health',
      streamInfo: '/api/stream-info',
      stream: '/api/stream'
    }
  });
});

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

// Catch-all route for SPA (Single Page Application)
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  try {
    // Try to send the index.html for non-API routes (SPA routing)
    const frontendIndexPath = path.join(__dirname, '../frontend/build/index.html');
    res.sendFile(frontendIndexPath);
  } catch (error) {
    // If the file doesn't exist, continue to the next middleware
    next();
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎵 Lofi streaming server running on 0.0.0.0:${PORT}`);
  console.log(`🌐 Stream URL: http://localhost:${PORT}/api/stream`);
});
