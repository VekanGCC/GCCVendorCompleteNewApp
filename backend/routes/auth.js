const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Mock users data (replace with database in production)
const mockUsers = [
  {
    id: "1",
    email: "vendor@techcorp.com",
    name: "John Smith",
    role: "vendor",
    company: "TechCorp Solutions",
    password: "demo123" // In production, this should be hashed
  },
  {
    id: "2",
    email: "client@innovate.com",
    name: "Sarah Johnson",
    role: "client",
    company: "Innovate Inc",
    password: "demo123"
  },
  {
    id: "3",
    email: "vendor2@devstudio.com",
    name: "Mike Chen",
    role: "vendor",
    company: "DevStudio",
    password: "demo123"
  },
  {
    id: "4",
    email: "client2@startup.com",
    name: "Emily Davis",
    role: "client",
    company: "StartupXYZ",
    password: "demo123"
  }
];

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    
    // Find user
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    // Generate mock JWT token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    
    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  try {
    // In a real application, you might invalidate the token here
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Mock token verification
    if (token.startsWith('mock-jwt-token-')) {
      const userId = token.split('-')[3];
      const user = mockUsers.find(u => u.id === userId);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        return res.json({
          success: true,
          user: userWithoutPassword
        });
      }
    }

    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;