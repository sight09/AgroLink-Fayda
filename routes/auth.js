const express = require('express');
const router = express.Router();
const { login, callback } = require('../controllers/authController');

// Fayda auth routes
router.get('/login', login);
router.get('/callback', callback);

// Optional test route to verify routing
router.get('/test', (req, res) => {
  res.send('Auth route is working!');
});

module.exports = router;
