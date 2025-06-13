const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Mock applications data
let mockApplications = require('../data/applications.json');

// Get all applications
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockApplications,
      count: mockApplications.length
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new application
router.post('/', [
  body('resourceId').notEmpty(),
  body('requirementId').notEmpty(),
  body('vendorId').notEmpty(),
  body('clientId').notEmpty(),
  body('appliedBy').isIn(['vendor', 'client'])
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

    const newApplication = {
      id: Date.now().toString(),
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    mockApplications.push(newApplication);

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: newApplication
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update application status
router.patch('/:id/status', [
  body('status').isIn(['pending', 'shortlisted', 'rejected', 'under-interview', 'selected', 'onboarded']),
  body('notes').optional().isString()
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

    const applicationIndex = mockApplications.findIndex(a => a.id === req.params.id);
    
    if (applicationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    mockApplications[applicationIndex].status = req.body.status;
    mockApplications[applicationIndex].updatedAt = new Date().toISOString().split('T')[0];
    
    if (req.body.notes) {
      mockApplications[applicationIndex].notes = req.body.notes;
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        id: req.params.id,
        status: req.body.status,
        notes: req.body.notes,
        updatedAt: mockApplications[applicationIndex].updatedAt
      }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;