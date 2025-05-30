# Lofi Streaming App

A beautiful lofi music streaming application with a React frontend and Express backend that streams music from YouTube.

![Lofi Stream](https://img.shields.io/badge/Music-Lofi-purple?style=for-the-badge&logo=spotify)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)

## Features

- 🎵 **Live YouTube Streaming** - Direct streaming from YouTube lofi channels
- 🎨 **Beautiful UI** - Modern, responsive design with glassmorphism effects
- 🎛️ **Audio Controls** - Play/pause, volume control, and mute functionality
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- ⚡ **Real-time Updates** - Live stream information and status
- 🌈 **Smooth Animations** - Engaging visual effects and transitions

## Project Structure

```
lofi-streaming-app/
├── backend/                 # Express.js backend
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styling
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   ├── public/
│   │   └── index.html     # HTML template
│   └── package.json       # Frontend dependencies
├── package.json           # Root package.json for scripts
└── README.md             # This file
```

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   cd lofi-streaming-app
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the application (frontend only demo)**
   ```bash
   cd frontend
   npm start
   ```

   This will start the frontend on `http://localhost:3000` with a fallback streaming source.

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the application

### Full Setup (Backend + Frontend)

If you want to run both the backend and frontend together:

1. **Update the port in backend/server.js** to an available port on your system

2. **Update the proxy in frontend/package.json** to match the backend port

3. **Start the backend**
   ```bash
   cd backend
   npm run dev
   ```

4. **Start the frontend in another terminal**
   ```bash
   cd frontend
   npm start
   ```

## Manual Setup

If you prefer to set up each part manually:

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Available Scripts

### Root Level Scripts

- `npm run dev` - Start both backend and frontend in development mode
- `npm run install-all` - Install dependencies for both backend and frontend
- `npm run build` - Build the frontend for production
- `npm start` - Start the backend in production mode

### Backend Scripts

- `npm start` - Start the backend server
- `npm run dev` - Start backend with nodemon (auto-restart on changes)

### Frontend Scripts

- `npm start` - Start the React development server
- `npm run build` - Build the app for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## Deployment on Ubuntu Server

For deploying on an Ubuntu server, follow these steps:

### Using the Deployment Script

The easiest way to deploy is using the included deployment script:

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

This will:
1. Check and stop any existing processes using port 5000
2. Install all dependencies
3. Build the frontend for production
4. Start the server with the SERVER_DEPLOY environment variable set

### Running as a System Service

For a more robust deployment that restarts automatically and runs in the background:

1. Copy the provided systemd service file to the system directory:
   ```bash
   sudo cp lockin-lofi.service /etc/systemd/system/
   ```

2. Modify the service file if your installation path is different:
   ```bash
   sudo nano /etc/systemd/system/lockin-lofi.service
   ```

3. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable lockin-lofi
   sudo systemctl start lockin-lofi
   ```

4. Check the service status:
   ```bash
   sudo systemctl status lockin-lofi
   ```

### Troubleshooting Server Deployment

If you encounter YouTube API issues on your server (as seen in the error logs), the application will automatically fall back to direct audio streams. This is expected behavior as many server IPs are blocked by YouTube's bot protection.

The SERVER_DEPLOY environment variable tells the application to prioritize direct streams over attempting to access YouTube content, which makes the deployment more reliable on servers.

## API Endpoints

### Backend API

- `GET /api/health` - Health check endpoint
- `GET /api/stream-info` - Get information about the current stream
- `GET /api/stream` - Audio stream endpoint

## Technology Stack

### Backend
- **Express.js** - Web framework
- **ytdl-core** - YouTube downloader library
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React** - UI library
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **CSS3** - Modern styling with glassmorphism effects

## Features in Detail

### Audio Streaming
- Direct streaming from YouTube using ytdl-core
- High-quality audio extraction
- Real-time stream status updates

### User Interface
- Vinyl record animation that spins when playing
- Glassmorphism design with backdrop filters
- Responsive design for all screen sizes
- Smooth animations and transitions

### Controls
- Play/Pause functionality
- Volume control with slider
- Mute/Unmute toggle
- Visual feedback for all interactions

## Configuration

### Backend Configuration

The backend can be configured via environment variables in `backend/.env`:

```env
PORT=5000
NODE_ENV=development
```

### Stream URL

The YouTube stream URL is currently set to:
`https://www.youtube.com/watch?v=jfKfPfyJRdk`

To change it, modify the `LOFI_URL` constant in `backend/server.js`.

## Troubleshooting

### Common Issues

1. **Audio not playing**
   - Check if the YouTube URL is valid and accessible
   - Ensure the backend server is running
   - Check browser console for errors

2. **CORS errors**
   - The backend includes CORS middleware to handle cross-origin requests
   - Make sure both servers are running on the correct ports

3. **Module not found errors**
   - Run `npm run install-all` to ensure all dependencies are installed
   - Clear node_modules and reinstall if issues persist

### Browser Compatibility

This application works best on modern browsers that support:
- ES6+ features
- CSS backdrop-filter
- Audio streaming
- Fetch API

## Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests
- Improving documentation

## License

This project is licensed under the MIT License.

## Acknowledgments

- YouTube for providing the streaming content
- The lofi hip-hop community for amazing music
- React and Express.js communities for excellent frameworks
