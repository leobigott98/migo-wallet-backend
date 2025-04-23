const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// Load the public key for token verification
const publicKeyPath = path.join(__dirname, '../keys/public_key.pem');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

// Middleware to authenticate JWT tokens
// This middleware checks for the presence of a JWT in the Authorization header
const authenticateToken = (req, res, next) => {
    // Check for the Authorization header
    if (!req.headers['authorization']) {
        return res.status(401).json({ message: 'Authorization header is missing' });
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Check if the token is present
    // If the token is not present, return a 401 Unauthorized response
    if (!token) {
        return res.status(401).json({ message: 'Access token is missing or invalid' });
    }

    // Verify the token using the public key
    // If the token is valid, attach the user information to the request object and call next()
    jwt.verify(token, publicKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;