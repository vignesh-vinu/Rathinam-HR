const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Login Route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const data = db.read();
  const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Simple password verification for demo: password matches or is 'admin123' / 'viewer123'
  if (password !== user.passwordHash && password !== 'admin123' && password !== 'viewer123') {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Generate mock JWT token
  const token = `token-${user.id}-${Date.now()}`;

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      avatar: user.avatar
    }
  });
});

// Verify 2FA OTP simulation
router.post('/verify-2fa', (req, res) => {
  const { otp } = req.body;
  if (otp === '123456' || otp === '654321' || (otp && otp.length === 6)) {
    return res.json({ success: true, message: '2FA verification successful' });
  }
  return res.status(400).json({ error: 'Invalid OTP code. Please use 123456 for testing.' });
});

// Get Current User Profile
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer token-')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = authHeader.split('Bearer token-')[1].split('-')[0];
  const data = db.read();
  const user = data.users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      avatar: user.avatar
    }
  });
});

module.exports = router;
