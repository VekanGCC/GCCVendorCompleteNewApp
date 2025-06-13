const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Mock users data
const mockUsers = [
  {
    id: "1",
    email: "vendor@techcorp.com",
    name: "John Smith",
    role: "vendor",
    company: "TechCorp Solutions"
  },
  {
    id: "2",
    email: "client@innovate.com",
    name: "Sarah Johnson",
    role: "client",
    company: "Innovate Inc"
  },
  {
    id: "3",
    email: "vendor2@devstudio.com",
    name: "Mike Chen",
    role: "vendor",
    company: "DevStudio"
  },
  {
    id: "4",
    email: "client2@startup.com",
    name: "Emily Davis",
    role: "client",
    company: "StartupXYZ"
  }
];

// Get all users
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockUsers,
      count: mockUsers.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user by ID
router.get('/:id', (req, res) => {
  try {
    const user = mockUsers.find(u => u.id === req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;