const express = require('express');
const router = express.Router();
const passport = require('passport');
const Vessel = require('../models/Vessel');

// @route GET api/vessels
// @desc Get all vessels
// @access Private
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const vessels = await Vessel.findAll();
    res.json(vessels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route POST api/vessels
// @desc Create a new vessel
// @access Private
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const vessel = await Vessel.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.json(vessel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route PUT api/vessels/:id
// @desc Update a vessel
// @access Private
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const vessel = await Vessel.findByPk(req.params.id);
    if (!vessel) {
      return res.status(404).json({ message: 'Vessel not found' });
    }
    await vessel.update(req.body);
    res.json(vessel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route DELETE api/vessels/:id
// @desc Delete a vessel
// @access Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const vessel = await Vessel.findByPk(req.params.id);
    if (!vessel) {
      return res.status(404).json({ message: 'Vessel not found' });
    }
    await vessel.destroy();
    res.json({ message: 'Vessel deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
