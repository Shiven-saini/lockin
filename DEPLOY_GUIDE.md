# Deployment Guide for Ubuntu Server

This guide will help you deploy the Lofi Streaming App on your Ubuntu server.

## Prerequisites

- Ubuntu Server
- Node.js v14 or higher
- npm
- Git (optional)

## Step 1: Transfer the Application to Your Server

If you're starting from scratch, clone the repository:
```bash
git clone https://github.com/shiven-saini/lockin.git
cd lockin
```

Or transfer your local files to the server using scp or rsync:
```bash
rsync -avz /path/to/local/lockin/ shiven@ubuntu.one:/home/ubuntu/lockin/
```

## Step 2: Deploy Using the Script

The easiest way to deploy is using our deployment script:

```bash
cd /home/ubuntu/lockin
chmod +x deploy.sh
./deploy.sh
```

This will:
1. Check and kill any processes using port 5000
2. Install all dependencies
3. Build the frontend
4. Start the server with the correct environment settings

## Step 3: Setting Up as a System Service (Recommended)

For a more robust setup that runs in the background and restarts automatically:

1. Copy the service file to the systemd directory:
```bash
sudo cp /home/ubuntu/lockin/lockin-lofi.service /etc/systemd/system/
```

2. Edit the service file if needed to match your installation path:
```bash
sudo nano /etc/systemd/system/lockin-lofi.service
```

3. Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable lockin-lofi
sudo systemctl start lockin-lofi
```

4. Check if the service is running:
```bash
sudo systemctl status lockin-lofi
```

## Step 4: Accessing the Application

If everything was deployed correctly, you can access the application at:
```
http://your-server-ip:5000
```

## Troubleshooting

### Log Checking

To check the logs for issues:
```bash
sudo journalctl -u lockin-lofi -f
```

### Port Issues

If port 5000 is already in use, you can either:
1. Kill the process using the port:
```bash
sudo lsof -i:5000
sudo kill -9 <PID>
```

2. Or change the port in `/home/ubuntu/lockin/backend/server.js`

### Restarting the Service

If you need to restart the service:
```bash
sudo systemctl restart lockin-lofi
```

### Stopping the Service

To stop the service:
```bash
sudo systemctl stop lockin-lofi
```

## Maintaining the Application

### Updates

To update the application:
1. Pull the latest changes or update your files
2. Run the deploy script again:
```bash
cd /home/ubuntu/lockin
./deploy.sh
```
3. Restart the service if it's running:
```bash
sudo systemctl restart lockin-lofi
```

### Backup

To backup your deployment:
```bash
tar -czvf lockin-backup.tar.gz /home/ubuntu/lockin
```

## Additional Notes

- The application now prioritizes direct audio streams on servers to avoid YouTube API issues
- The deployment script sets the `SERVER_DEPLOY=true` environment variable automatically
- Logs will be stored in the systemd journal when running as a service
