import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
    origin: [
        'https://112-studios.github.io/112web/src/frontend/Home.html#home',
        'https://112-studios.github.io/112web/src/frontend/About-Us.html#about',
        'https://112-studios.github.io/112web/src/frontend/Games.html#games',
        'https://112-studios.github.io/112web/src/frontend/Careers.html#careers',
        'https://112-studios.github.io/112web/src/frontend/newsletter.html'
    ],
    methods: ['GET', 'POST', 'OPTIONS']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Endpoint to handle newsletter subscription
app.post('/subscribe', (req, res) => {
    const { email } = req.body;

    // Simple email validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email address.' });
    }

    // Save email to CSV file
    const csvFilePath = path.join(__dirname, 'newsSubs.csv');
    fs.appendFile(csvFilePath, `${email}\n`, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error saving email.' });
        }
        res.status(200).json({ message: 'Successfully subscribed!' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
