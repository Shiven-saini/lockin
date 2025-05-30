const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const play = require('play-dl');
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

// Alternative audio streams in case YouTube fails
const ALTERNATIVE_STREAMS = [
  {
    url: "https://play.streamafrica.net/lofiradio",
    type: "audio/mpeg",
    title: "Stream Africa Lofi Radio",
    description: "24/7 lofi hip hop radio - smooth beats to relax or study to"
  },
  {
    url: "https://streams.ilovemusic.de/iloveradio17.mp3",
    type: "audio/mpeg",
    title: "I Love Music Lofi Radio",
    description: "Chill beats for studying and relaxing"
  },
  {
    url: "https://mp3.chillhop.com/serve.php/?mp3=9272",
    type: "audio/mpeg",
    title: "Chillhop Radio",
    description: "Chill beats, lofi hip hop - 24/7 radio"
  }
];

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
    // Check if we're running in a server environment (process.env.NODE_ENV === 'production')
    // or if an environment variable SERVER_DEPLOY is set
    const isServerDeploy = process.env.NODE_ENV === 'production' || process.env.SERVER_DEPLOY === 'true';
    
    // If we're in a server environment, prioritize alternative streams to avoid YouTube restrictions
    if (isServerDeploy) {
      console.log('Server deployment detected - using alternative stream info');
      const fallbackStream = ALTERNATIVE_STREAMS[0];
      res.json({
        title: fallbackStream.title,
        description: fallbackStream.description,
        thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg",
        url: fallbackStream.url,
        isAlternative: true
      });
      return;
    }
    
    // If we're not in a server environment, try YouTube sources first
    try {
      console.log('Fetching info with play-dl...');
      const playInfo = await play.video_info(LOFI_URL);
      const videoDetails = playInfo.video_details;
      const title = videoDetails.title || 'Lofi Stream';
      const description = videoDetails.description || 'Lofi beats to relax/study to';
      const thumbnail = videoDetails.thumbnails?.[0]?.url || '';
      
      res.json({
        title,
        description: description.substring(0, 200) + '...',
        thumbnail,
        url: LOFI_URL
      });
      return;
    } catch (playError) {
      console.error('play-dl error:', playError);
      // Continue to ytdl-core if play-dl fails
    }
    
    // Fallback to ytdl-core
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
    } catch (ytdlError) {
      console.error('ytdl-core error:', ytdlError);
      
      // Return alternative stream if both methods fail
      const fallbackStream = ALTERNATIVE_STREAMS[0];
      res.json({
        title: fallbackStream.title,
        description: fallbackStream.description,
        thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg",
        url: fallbackStream.url,
        isAlternative: true
      });
    }
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
    
    // Check if we're running in a server environment
    const isServerDeploy = process.env.NODE_ENV === 'production' || process.env.SERVER_DEPLOY === 'true';
    
    // If we're in a server environment, use alternative streams directly
    if (isServerDeploy) {
      console.log('Server deployment detected - using direct alternative stream');
      res.redirect(ALTERNATIVE_STREAMS[0].url);
      return;
    }
    
    // Try with play-dl first since ytdl-core is having issues
    try {
      console.log('Trying play-dl for streaming...');
      const stream = await play.stream(LOFI_URL, { quality: 2 }); // 2 is for audio-only streams
      
      if (!stream || !stream.stream) {
        throw new Error('Could not get stream from play-dl');
      }
      
      console.log('Stream obtained from play-dl');
      stream.stream.pipe(res);
      
      stream.stream.on('error', (error) => {
        console.error('Stream error with play-dl:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream error with play-dl' });
        }
      });
      
      return; // Return early if play-dl works
    } catch (playError) {
      console.error('play-dl streaming error:', playError);
      // Continue to ytdl-core if play-dl fails and headers not sent yet
      if (res.headersSent) {
        return; // Can't continue if headers already sent
      }
    }
    
    // Try with ytdl-core as fallback
    try {
      // Get video info and find audio format
      console.log('Falling back to ytdl-core for streaming');
      const info = await ytdl.getInfo(LOFI_URL);
      console.log('Video info fetched successfully with ytdl-core');
      
      const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
      console.log(`Found ${audioFormats.length} audio formats with ytdl-core`);
      
      if (audioFormats.length === 0) {
        console.error('No audio formats found in the YouTube video');
        throw new Error('No audio formats found');
      }
      
      // Stream the audio
      console.log('Starting audio stream with ytdl-core');
      const stream = ytdl(LOFI_URL, {
        quality: 'highestaudio',
        filter: 'audioonly'
      });
      
      stream.pipe(res);
      
      stream.on('error', (error) => {
        console.error('Stream error with ytdl-core:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream error with ytdl-core' });
        }
      });
      
      return; // Return early if ytdl-core works
    } catch (ytdlError) {
      console.error('ytdl-core streaming error:', ytdlError);
      // Continue to fallback if ytdl-core fails and headers not sent yet
      if (res.headersSent) {
        return; // Can't continue if headers already sent
      }
    }
    
    // Direct fallback to alternative streams if all YouTube methods fail
    try {
      if (!res.headersSent) {
        console.log('Falling back to direct alternative stream');
        // Create a more detailed log of the failure
        console.log('All YouTube streaming methods failed. Using direct alternative stream.');
        
        // Redirect to an alternative audio stream
        res.redirect(ALTERNATIVE_STREAMS[0].url);
      }
    } catch (redirectError) {
      console.error('Redirect error:', redirectError);
      if (!res.headersSent) {
        res.status(500).json({ error: 'All streaming methods failed' });
      }
    }
    
  } catch (error) {
    console.error('Error starting stream:', error.stack);
    console.error('Error message:', error.message);
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

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
