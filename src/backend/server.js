// --- IMPORTS --- \\
import express, { urlencoded, json } from 'express';
import { join } from 'path';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';

// --- START-UP --- \\
const app = express();
const port = 5500;
const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const csvFilePath = join(__dirname, 'models', 'newsSubs.csv');
const csvWriter = createCsvWriter({
  path: csvFilePath,
  header: [
    { id: 'email', title: 'Email' },
  ],
});

// Setup middleware for parsing form data and JSON
app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());

// Helper function to check allowed email domain
function isAllowedDomain(email) {
  const domain = email.split('@')[1];
  return allowedDomains.includes(domain);
}

// Modify the POST route to read existing records
app.post('/subscribe', (req, res) => {
  console.log('Request Body:', req.body);
  const { email } = req.body;

  if (!isAllowedDomain(email)) {
      return res.status(400).send('Invalid email domain. Only Gmail, Yahoo, Outlook, Hotmail, and iCloud are allowed.');
  }

  fs.readFile(csvFilePath, 'utf8', (err, data) => {
      if (err && err.code !== 'ENOENT') {
          console.error('Error reading CSV file:', err);
          return res.status(500).send('Failed to subscribe. Please try again.');
      }

      const existingEmails = data ? data.split('\n').map(line => line.split(',')[1]) : [];

      if (existingEmails.includes(email)) {
          return res.status(400).send('Email is already subscribed.');
      }

      csvWriter.writeRecords([{ email }])
          .then(() => {
              console.log("Email Saved!");
              res.send('You are subscribed to the newsletter!');
          })
          .catch((err) => {
              console.error('Error saving email to CSV:', err);
              res.status(500).send('Failed to subscribe. Please try again.');
          });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
console.log("Server is running base, 1");