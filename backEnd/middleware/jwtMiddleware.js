// Module to handle JWT-based session authentication

const jwt = require('jsonwebtoken');

const secretKey = 'b7f9a1c3e5d7f8429a6b4c2e1d8f03a7c9e6f5d2b4a1e8c37d6f9b0245a7c8d3';

// Function to sign JWT token
function createToken(payload) {
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

// Function to verify JWT token
function verifyToken(token) {
    try {
        return jwt.verify(token, secretKey);
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return null;
    }
}

// Function to authenticate JWT session token
function authenticateToken(req, res, next) {
    const token = req.cookies.authToken; 
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
    req.user = decoded; 
    next();
}

module.exports = { createToken, verifyToken, authenticateToken };
