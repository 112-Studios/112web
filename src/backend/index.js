import express from 'express';
import { WebSocketServer } from 'ws';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';

const app = express();
const port = 5000; // Change this to a valid port number (51048 is out of range)

// Middleware to authenticate users with JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(403);
  
    jwt.verify(token, 'secret-key', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Load initial stats from the stats file
let stats = {
    activePlayers: 0,
    visits: 0,
    likes: 0,
    favorites: 0,
};

// Load stats from a JSON file (persistent storage)
const loadStats = async () => {
    try {
        const data = await fs.readFile('gameStats.json', 'utf-8');
        stats = JSON.parse(data);
    } catch (err) {
        console.log('Error loading stats:', err);
    }
};

// Save stats to a JSON file periodically or when needed
const saveStats = async () => {
    try {
        await fs.writeFile('gameStats.json', JSON.stringify(stats), 'utf-8');
    } catch (err) {
        console.log('Error saving stats:', err);
    }
};

// Load stats on server start
await loadStats();

// HTTP route to get current stats
app.get('/stats', authenticateToken, (_req, res) => {
    res.json({ stats, serverStatus: 'online' });
});

// Simulate visits, likes, or favorites on different API routes
app.post('/increment/:stat', authenticateToken, async (req, res) => {
    const { stat } = req.params;
    if (['visits', 'likes', 'favorites'].includes(stat)) {
        stats[stat]++;
        await saveStats();
        return res.json({ [stat]: stats[stat] });
    }
    res.sendStatus(400);
});

// WebSocket for real-time updates
const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (ws) => {
    stats.activePlayers++;
    broadcastStats();
    
    ws.on('close', async () => {
        stats.activePlayers--;
        await saveStats();
        broadcastStats();
    });
});

// Broadcast updated stats to all clients
const broadcastStats = () => {
    const statData = { stats, serverStatus: 'online' };
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(statData));
        }
    });
};

// Save stats periodically every minute
setInterval(saveStats, 60000);

// Start HTTP server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
