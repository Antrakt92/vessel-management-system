const express = require('express');
const router = express.Router();
const passport = require('passport');
const vesselController = require('../controllers/vesselController');
const asyncHandler = require('../utils/asyncHandler');

// Auth middleware
const auth = passport.authenticate('jwt', { session: false });

// @route GET api/vessels
// @desc Get all vessels
// @access Private
router.get('/', auth, asyncHandler(vesselController.getAllVessels));

// @route POST api/vessels
// @desc Create a new vessel
// @access Private
router.post('/', auth, asyncHandler(vesselController.createVessel));

// @route PUT api/vessels/:id
// @desc Update a vessel
// @access Private
router.put('/:id', auth, asyncHandler(vesselController.updateVessel));

// @route DELETE api/vessels/:id
// @desc Delete a vessel
// @access Private
router.delete('/:id', auth, asyncHandler(vesselController.deleteVessel));

module.exports = router;
