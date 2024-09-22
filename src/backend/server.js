// ------ IMPORTS ------ \\
import express, { json } from 'express';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import nodemailer from 'nodemailer';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import fs from 'fs';
import { User } from './models/Users.js';
import { GameStats } from './models/GameStats.js';


// ------ SECRETS SETUP ------ \\

config(); // Load environment variables
const mongoUri = process.env.MONGODB_URI;

// ------ SECURITY RATE SETUP ------ \\

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

// ------ EXPRESS, ALLOWED ORIGINS ------ \\

const app = express();
app.set('trust proxy', 1); // Trust first proxy
app.use(json());
app.use(helmet());
app.use(cors({
    origin: ['https://112-studios.github.io', 'https://15fe-89-153-106-173.ngrok-free.app']
}));
app.use(limiter);

// ------ CONNECTION WITH DATA-BASE ------ \\

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// ------ NEWSLETTER ROUTES ------ \\

// Create a transporter for Nodemailer using Gmail's SMTP server
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
});

// Store verification codes in memory
const verificationCodes = {};

// Newsletter route to send verification email
app.post('/send-verification', (req, res) => {
    const { email } = req.body;

    // Validate the email format
    if (!validator.isEmail(email)) {
        return res.status(400).send('Invalid email');
    }

    // Generate a 6-digit random verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes[email] = verificationCode; // Store the code in memory

    // Define the email options
    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to: email, // Receiver address
        subject: 'Your Newsletter Verification Code',
        text: `Your verification code is: ${verificationCode}`, // Email body
    };

    // Send the email using Nodemailer
    transporter.sendMail(mailOptions)
        .then(() => {
            res.send('Verification email sent'); // Success response
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Failed to send email'); // Error response
        });
});

// Newsletter route to verify the code
app.post('/verify-code', (req, res) => {
    const { email, code } = req.body;

    // Check if the provided code matches the stored one
    if (verificationCodes[email] === code) {
        delete verificationCodes[email]; // Remove the code after use

        // Save the verified email to CSV
        const csvLine = `${email},${new Date().toISOString()}\n`;
        fs.appendFileSync('./backend/newsSubs.csv', csvLine); // Save to the CSV file

        res.send('You are subscribed to the newsletter!'); // Success response
    } else {
        res.status(400).send('Verification failed'); // Error response for invalid code
    }
});


// ------ SETUP & LOAD OF GAME STATS ------ \\

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
            $set: stats
        }, { upsert: true });
    } catch (err) {
        console.error('Error saving stats to MongoDB:', err);
    }
};

// ------ AUTHENTICATION & ACCOUNTS ------ \\

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
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

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).send('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    try {
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
