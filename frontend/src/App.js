import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import './App.css';

// Configure axios
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [streamInfo, setStreamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  useEffect(() => {
    fetchStreamInfo();
    
    // Setup audio event listeners when component mounts
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('canplaythrough', () => {
        console.log('Audio can play through');
        setLoading(false);
      });
      
      audio.addEventListener('waiting', () => {
        console.log('Audio is waiting for more data');
      });
      
      audio.addEventListener('playing', () => {
        console.log('Audio is playing');
        setError(null);
      });
    }
    
    // Clean up event listeners when component unmounts
    return () => {
      if (audio) {
        audio.removeEventListener('canplaythrough', () => {});
        audio.removeEventListener('waiting', () => {});
        audio.removeEventListener('playing', () => {});
      }
    };
  }, []);
  const fetchStreamInfo = async () => {
    try {
      setLoading(true);
      try {
        const response = await axios.get('/api/stream-info');
        console.log('Stream info received:', response.data);
        setStreamInfo(response.data);
      } catch (apiError) {
        console.error('API error:', apiError);
        // Fallback for demo if API is unavailable
        console.log('Using fallback stream info');
        setStreamInfo({
          title: "Lofi Hip Hop Radio - beats to relax/study to",
          description: "24/7 lofi hip hop radio - smooth beats to relax or study to. Perfect to play in the background while you're working, studying, or just chilling.",
          thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg",
          url: "https://www.youtube.com/watch?v=jfKfPfyJRdk"
        });
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching stream info:', err);
      setError('Failed to load stream information');
    } finally {
      setLoading(false);
    }
  };
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setError(null);
            console.log('Audio playback started successfully');
          })
          .catch(err => {
            console.error('Error playing audio:', err);
            setError('Failed to play audio: ' + (err.message || 'Please try again or use a different browser'));
            setIsPlaying(false);
            // Try an alternative source if the current one fails
            tryAlternativeSource();
          });
      }
    }
  };
  
  const tryAlternativeSource = () => {
    // List of fallback audio streams
    const fallbackStreams = [
      "/api/stream",
      "https://play.streamafrica.net/lofiradio",
      "https://streams.ilovemusic.de/iloveradio17.mp3",
      "https://mp3.chillhop.com/serve.php/?mp3=9272"
    ];
    
    // Find current source index
    const currentSrc = audioRef.current.src;
    const currentIndex = fallbackStreams.findIndex(src => 
      currentSrc.endsWith(src) || currentSrc === src
    );
    
    // Try the next source in the list
    const nextIndex = (currentIndex + 1) % fallbackStreams.length;
    audioRef.current.src = fallbackStreams[nextIndex];
    
    console.log(`Trying alternative source: ${fallbackStreams[nextIndex]}`);
    setTimeout(() => {
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setError(null);
        })
        .catch(err => {
          console.error('Alternative source also failed:', err);
          setError('All audio sources failed. Please check your internet connection or try again later.');
        });
    }, 1000);
  };

  const toggleMute = () => {
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };
  const handleAudioError = (e) => {
    console.error('Audio error event:', e);
    console.error('Error code:', e.target.error ? e.target.error.code : 'unknown');
    console.error('Current src:', audioRef.current.src);
    
    setError('Audio stream error. Trying alternative sources...');
    setIsPlaying(false);
    
    // Automatically try alternative source on error
    tryAlternativeSource();
  };
  if (loading) {
    return (
      <div className="app loading">
        <div className="loading-content">
          <div className="spin"></div>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }
  return (
    <div className="app">
      <div className="minimal-container">
        <header className="minimal-header">
          <h1>LOCK IN</h1>
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <div className="error-actions">
                <button onClick={tryAlternativeSource} className="minimal-btn">
                  Try Another Source
                </button>
                <button onClick={fetchStreamInfo} className="minimal-btn secondary">
                  Refresh
                </button>
              </div>
            </div>
          )}
        </header>

        <div className="player-container">
          <div className="visualizer-container">
            <div className={`visualizer ${isPlaying ? 'active' : ''}`}>
              {[...Array(20)].map((_, i) => (
                <div key={i} className="visualizer-bar"></div>
              ))}
            </div>
          </div>
          
          <div className="minimal-controls">
            <div className="play-container">
              <button 
                className={`minimal-play-btn ${isPlaying ? 'playing' : ''}`}
                onClick={togglePlay}
                disabled={!streamInfo}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
            </div>
            
            <div className="volume-container">
              <button 
                className="minimal-volume-btn"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="minimal-volume-slider"
                aria-label="Volume"
              />
            </div>
          </div>
          
          <div className="status-text">
            {isPlaying ? 'Now playing lofi beats' : 'Ready to lock in'}
          </div>
        </div>
      </div>
      
      <footer className="minimal-footer">
        <p>&copy; 2025 Developed by Shiven Saini</p>
      </footer>      <audio
        ref={audioRef}
        src="/api/stream"
        onError={handleAudioError}
        onLoadStart={() => console.log('Loading audio...')}
        onCanPlay={() => setLoading(false)}
        crossOrigin="anonymous"
        preload="auto"
        playsInline
      >
        <source src="/api/stream" type="audio/mpeg" />
        <source src="https://play.streamafrica.net/lofiradio" type="audio/mpeg" />
        <source src="https://streams.ilovemusic.de/iloveradio17.mp3" type="audio/mpeg" />
        <source src="https://mp3.chillhop.com/serve.php/?mp3=9272" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

export default App;
