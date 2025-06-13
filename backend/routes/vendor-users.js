const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Mock vendor users data
let mockVendorUsers = require('../data/vendor-users.json');

// Get all vendor users
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockVendorUsers,
      count: mockVendorUsers.length
    });
  } catch (error) {
    console.error('Get vendor users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new vendor user
router.post('/', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('role').isIn(['admin', 'manager', 'user']),
  body('vendorId').notEmpty(),
  body('createdBy').notEmpty().trim()
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

    const newUser = {
      id: Date.now().toString(),
      ...req.body,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    mockVendorUsers.push(newUser);

    res.status(201).json({
      success: true,
      message: 'Vendor user created successfully',
      data: newUser
    });
  } catch (error) {
    console.error('Create vendor user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update vendor user status
router.patch('/:id/status', [
  body('status').isIn(['active', 'inactive'])
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

    const userIndex = mockVendorUsers.findIndex(u => u.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Vendor user not found'
      });
    }

    mockVendorUsers[userIndex].status = req.body.status;

    res.json({
      success: true,
      message: 'Vendor user status updated successfully',
      data: {
        id: req.params.id,
        status: req.body.status
      }
    });
  } catch (error) {
    console.error('Update vendor user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;