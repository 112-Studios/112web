import express, { json } from 'express';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { WebSocketServer } from 'ws';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from './models/Users.js';
import { GameStats } from './models/GameStats.js';

config(); // Load environment variables

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

const app = express();
app.set('trust proxy', 1); // Trust first proxy
app.use(json());
app.use(helmet());
app.use(cors({
    origin: ['https://112-studios.github.io', 'https://f3d9-87-196-81-251.ngrok-free.app']
}));
app.use(limiter);

const mongoUri = process.env.MONGODB_URI; // Ensure this matches your .env variable name

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

let stats = {
    activePlayers: 0,
    visits: 0,
    likes: 0,
    favorites: 0,
};

const loadStats = async () => {
    try {
        const statsFromDb = await GameStats.findOne({});
        if (statsFromDb) {
            stats = {
                activePlayers: statsFromDb.activePlayers,
                visits: statsFromDb.visits,
                likes: statsFromDb.likes,
                favorites: statsFromDb.favorites,
            };
        }
    } catch (err) {
        console.error('Error loading stats from MongoDB:', err);
    }
};

const saveStats = async () => {
    try {
        await GameStats.updateOne({}, {
            $set: {
                activePlayers: stats.activePlayers,
                visits: stats.visits,
                likes: stats.likes,
                favorites: stats.favorites,
            }
        }, { upsert: true }); // Use upsert to create the document if it doesn't exist
    } catch (err) {
        console.error('Error saving stats to MongoDB:', err);
    }
};


const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Make sure it's split properly
    if (!token) return res.sendStatus(403); // No token provided

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token is invalid
        req.user = user; // Token is valid, proceed
        next();
    });
};

app.get('/', (_req, res) => {
    res.send('Welcome to 112-Studios API');
});

// Register route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });

    try {
        await user.save();
        res.status(201).send('User registered');
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Internal server error');
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).send('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).send('Invalid credentials');
    }

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Password reset route
app.post('/reset-password', async (req, res) => {
    const { username, newPassword } = req.body;

    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).send('User not found');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        // Update the user's password in the database
        user.password = hashedPassword;
        await user.save();
        res.status(200).send('Password updated successfully');
    } catch (err) {
        console.error('Error updating password:', err);
        res.status(500).send('Internal server error');
    }
});


// Load stats on server start
await loadStats();

app.get('/stats', authenticateToken, (_req, res) => {
    res.json({ stats, serverStatus: 'online' });
});

app.post('/increment/:stat', authenticateToken, async (req, res) => {
    const { stat } = req.params;
    if (['visits', 'likes', 'favorites'].includes(stat)) {
        stats[stat]++;
        await saveStats();
        return res.json({ [stat]: stats[stat] });
    }
    res.sendStatus(400);
});

// WebSocket setup
const wss = new WebSocketServer({ port: 8081 });
wss.on('connection', (ws) => {
    stats.activePlayers++;
    broadcastStats();
    
    ws.on('close', async () => {
        stats.activePlayers--;
        await saveStats();
        broadcastStats();
    });
});

const broadcastStats = () => {
    const statData = { stats, serverStatus: 'online' };
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(statData));
        }
    });
};

// Save stats every minute
setInterval(saveStats, 60000);

const PORT = process.env.PORT || 3000; // Use 3000 as the default port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
