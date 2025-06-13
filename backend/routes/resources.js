const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Mock resources data
let mockResources = require('../data/resources.json');

// Get all resources
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockResources,
      count: mockResources.length
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get resource by ID
router.get('/:id', (req, res) => {
  try {
    const resource = mockResources.find(r => r.id === req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new resource
router.post('/', [
  body('name').notEmpty().trim(),
  body('skills').isArray({ min: 1 }),
  body('experience').isInt({ min: 0 }),
  body('location').notEmpty().trim(),
  body('rate').isFloat({ min: 0 }),
  body('vendorId').notEmpty(),
  body('vendorName').notEmpty().trim()
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

    const newResource = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString().split('T')[0]
    };

    mockResources.push(newResource);

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: newResource
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update resource
router.put('/:id', [
  body('name').optional().notEmpty().trim(),
  body('skills').optional().isArray({ min: 1 }),
  body('experience').optional().isInt({ min: 0 }),
  body('location').optional().notEmpty().trim(),
  body('rate').optional().isFloat({ min: 0 })
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

    const resourceIndex = mockResources.findIndex(r => r.id === req.params.id);
    
    if (resourceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    mockResources[resourceIndex] = {
      ...mockResources[resourceIndex],
      ...req.body,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: mockResources[resourceIndex]
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete resource
router.delete('/:id', (req, res) => {
  try {
    const resourceIndex = mockResources.findIndex(r => r.id === req.params.id);
    
    if (resourceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    mockResources.splice(resourceIndex, 1);

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;