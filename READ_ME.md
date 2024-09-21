# 112-Studios Website

Welcome to the 112-Studios website repository! This project provides useful information, a newsletter feature, and game statistics for our community.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Features

- User registration and login with JWT authentication.
- Game statistics tracking (likes, visits, favorites, and active players).
- Real-time updates for game statistics via WebSocket.
- Rate limiting and security features using Helmet and CORS.

## Technologies Used

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: HTML, CSS, JavaScript
- **Libraries**: bcrypt, jsonwebtoken, express-rate-limit, helmet, cors, nodemailer, ws

## API Endpoints

- POST /register - Register a new user
- POST /login - Log in an existing user
- GET /stats - Retrieve game statistics (authentication required)
- POST /increment/:stat - Increment a specific game statistic (e.g., visits, likes, favorites)

## License
This project is licensed under the MIT License - see the LICENSE file for details.
