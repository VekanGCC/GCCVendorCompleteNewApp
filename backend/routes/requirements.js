const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Mock requirements data
let mockRequirements = require('../data/requirements.json');

// Get all requirements
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockRequirements,
      count: mockRequirements.length
    });
  } catch (error) {
    console.error('Get requirements error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get requirement by ID
router.get('/:id', (req, res) => {
  try {
    const requirement = mockRequirements.find(r => r.id === req.params.id);
    
    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Requirement not found'
      });
    }

    res.json({
      success: true,
      data: requirement
    });
  } catch (error) {
    console.error('Get requirement error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new requirement
router.post('/', [
  body('title').notEmpty().trim(),
  body('skills').isArray({ min: 1 }),
  body('experience').isInt({ min: 0 }),
  body('location').notEmpty().trim(),
  body('duration').notEmpty().trim(),
  body('budget').isFloat({ min: 0 }),
  body('description').notEmpty().trim(),
  body('clientId').notEmpty(),
  body('clientName').notEmpty().trim()
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

    const newRequirement = {
      id: Date.now().toString(),
      ...req.body,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0]
    };

    mockRequirements.push(newRequirement);

    res.status(201).json({
      success: true,
      message: 'Requirement created successfully',
      data: newRequirement
    });
  } catch (error) {
    console.error('Create requirement error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update requirement status
router.patch('/:id/status', [
  body('status').isIn(['open', 'in-progress', 'closed'])
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

    const requirementIndex = mockRequirements.findIndex(r => r.id === req.params.id);
    
    if (requirementIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Requirement not found'
      });
    }

    mockRequirements[requirementIndex].status = req.body.status;
    mockRequirements[requirementIndex].updatedAt = new Date().toISOString().split('T')[0];

    res.json({
      success: true,
      message: 'Requirement status updated successfully',
      data: {
        id: req.params.id,
        status: req.body.status
      }
    });
  } catch (error) {
    console.error('Update requirement status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;