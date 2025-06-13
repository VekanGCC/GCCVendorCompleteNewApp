const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Mock vendor skills data
let mockVendorSkills = require('../data/vendor-skills.json');

// Get all vendor skills
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockVendorSkills,
      count: mockVendorSkills.length
    });
  } catch (error) {
    console.error('Get vendor skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new vendor skill
router.post('/', [
  body('skillName').notEmpty().trim(),
  body('category').notEmpty().trim(),
  body('proficiencyLevel').isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  body('vendorId').notEmpty(),
  body('submittedBy').notEmpty().trim()
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

    const newSkill = {
      id: Date.now().toString(),
      ...req.body,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0]
    };

    mockVendorSkills.push(newSkill);

    res.status(201).json({
      success: true,
      message: 'Vendor skill created successfully',
      data: newSkill
    });
  } catch (error) {
    console.error('Create vendor skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update vendor skill status
router.patch('/:id/status', [
  body('status').isIn(['pending', 'approved', 'rejected']),
  body('reviewNotes').optional().isString()
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

    const skillIndex = mockVendorSkills.findIndex(s => s.id === req.params.id);
    
    if (skillIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Vendor skill not found'
      });
    }

    mockVendorSkills[skillIndex].status = req.body.status;
    mockVendorSkills[skillIndex].reviewedAt = new Date().toISOString().split('T')[0];
    
    if (req.body.reviewNotes) {
      mockVendorSkills[skillIndex].reviewNotes = req.body.reviewNotes;
    }

    res.json({
      success: true,
      message: 'Vendor skill status updated successfully',
      data: {
        id: req.params.id,
        status: req.body.status,
        reviewNotes: req.body.reviewNotes,
        reviewedAt: mockVendorSkills[skillIndex].reviewedAt
      }
    });
  } catch (error) {
    console.error('Update vendor skill status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;